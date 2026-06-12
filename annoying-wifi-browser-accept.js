#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2];
if (!url) {
  console.error("missing captive portal URL");
  process.exit(64);
}

const timeout = 20000;
const defaultBirthYear = process.env.ANNOYING_WIFI_BIRTH_YEAR || "1990";
const defaultGender = process.env.ANNOYING_WIFI_GENDER || "Male";
const captureDir = process.env.ANNOYING_WIFI_CAPTURE_DIR || "";

function normalizeOptionText(text) {
  return String(text || "").trim().toLowerCase();
}

function optionMatches(option, preferredText) {
  const optionText = normalizeOptionText(option.text);
  const optionValue = normalizeOptionText(option.value);
  const preferred = normalizeOptionText(preferredText);

  if (optionText === preferred || optionValue === preferred) return true;
  if (/^\d{4}$/.test(preferred)) return optionText.includes(preferred) || optionValue.includes(preferred);
  if (preferred === "male") return /(^|[^a-z])male([^a-z]|$)/i.test(option.text) || option.text.includes("男性");
  if (preferred === "female") return /(^|[^a-z])female([^a-z]|$)/i.test(option.text) || option.text.includes("女性");
  return optionText.includes(preferred) || optionValue.includes(preferred);
}

function cssString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function chooseSelectOption(select, preferredTexts) {
  const options = await select
    .locator("option")
    .evaluateAll((els) =>
      els.map((el) => ({
        value: el.value,
        text: (el.textContent || "").trim(),
      })),
    )
    .catch(() => []);

  const choice = options.find((option) => preferredTexts.some((text) => optionMatches(option, text)));
  if (!choice) return null;

  await select.selectOption(choice.value || { label: choice.text });
  return choice.text;
}

async function labelTextFor(page, control) {
  const id = await control.getAttribute("id").catch(() => "");
  if (id) {
    const label = await page
      .locator(`label[for="${cssString(id)}"]`)
      .first()
      .innerText({ timeout: 500 })
      .catch(() => "");
    if (label) return label;
  }

  return control
    .locator("xpath=ancestor::label[1]")
    .innerText({ timeout: 500 })
    .catch(() => "");
}

async function fillTextInputByHints(page, hints, value) {
  const inputs = page.locator(
    "input:not([type]), input[type='text'], input[type='tel'], input[type='number'], input[type='search']",
  );
  const count = await inputs.count().catch(() => 0);

  for (let index = 0; index < count; index += 1) {
    const input = inputs.nth(index);
    const descriptor = [
      await input.getAttribute("name").catch(() => ""),
      await input.getAttribute("id").catch(() => ""),
      await input.getAttribute("placeholder").catch(() => ""),
      await input.getAttribute("aria-label").catch(() => ""),
      await labelTextFor(page, input),
    ]
      .join(" ")
      .toLowerCase();

    if (!hints.some((hint) => descriptor.includes(hint))) continue;
    await input.fill(value, { timeout: 3000 });
    return true;
  }

  return false;
}

async function checkRequiredBoxes(page) {
  const boxes = page.locator("input[type='checkbox']");
  const count = await boxes.count().catch(() => 0);
  const checked = [];

  for (let index = 0; index < count; index += 1) {
    const box = boxes.nth(index);
    if (!(await box.isVisible().catch(() => false))) continue;
    if (await box.isChecked().catch(() => false)) continue;

    await box.check({ timeout: 3000 }).catch(async () => {
      await box.click({ timeout: 3000, force: true });
    });
    checked.push(`checkbox_${index + 1}`);
  }

  return checked;
}

async function fillUsenDemographics(page) {
  const bodyText = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
  if (!/USEN Free Wi-Fi|USEN CORPORATION|Birth Year|Gender|性別|生年|TULLY/i.test(bodyText)) return [];

  const selects = page.locator("select");
  const selectCount = await selects.count().catch(() => 0);

  const filled = [];
  const usedIndexes = new Set();

  for (let index = 0; index < selectCount; index += 1) {
    const selected = await chooseSelectOption(selects.nth(index), [defaultBirthYear, `${defaultBirthYear}Year`]).catch(
      () => null,
    );
    if (selected) {
      filled.push(`birth_year:${selected}`);
      usedIndexes.add(index);
      break;
    }
  }

  if (!filled.some((item) => item.startsWith("birth_year:"))) {
    const filledInput = await fillTextInputByHints(page, ["birth", "year", "生年", "誕生"], defaultBirthYear).catch(
      () => false,
    );
    if (filledInput) filled.push(`birth_year:${defaultBirthYear}`);
  }

  for (let index = 0; index < selectCount; index += 1) {
    if (usedIndexes.has(index)) continue;
    const selected = await chooseSelectOption(selects.nth(index), [
      defaultGender,
      defaultGender === "Male" ? "男性" : defaultGender,
    ]).catch(() => null);
    if (selected) {
      filled.push(`gender:${selected}`);
      usedIndexes.add(index);
      break;
    }
  }

  const checked = await checkRequiredBoxes(page).catch(() => []);
  filled.push(...checked);

  return filled;
}

async function collectDebugState(page) {
  const actions = await page
    .locator("button, a, input[type='submit'], input[type='button']")
    .evaluateAll((els) =>
      els
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: (el.value || el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim(),
          disabled: Boolean(el.disabled || el.getAttribute("aria-disabled") === "true"),
        }))
        .filter((item) => item.text)
        .slice(0, 20),
    )
    .catch(() => []);

  const selects = await page
    .locator("select")
    .evaluateAll((els) =>
      els.slice(0, 10).map((el) => ({
        name: el.getAttribute("name") || "",
        id: el.id || "",
        value: el.value || "",
        options: Array.from(el.options)
          .slice(0, 8)
          .map((option) => option.textContent?.trim() || option.value || ""),
      })),
    )
    .catch(() => []);

  return { actions, selects };
}

async function writeCapture(page, payload) {
  if (!captureDir) return payload;

  await fs.mkdir(captureDir, { recursive: true }).catch(() => {});

  const [html, screenshot] = await Promise.all([
    page.content().catch(() => ""),
    page.screenshot({ fullPage: true }).catch(() => null),
  ]);
  const htmlPath = path.join(captureDir, "last-page.html");
  const screenshotPath = path.join(captureDir, "last-page.png");
  const jsonPath = path.join(captureDir, "last-result.json");
  const enrichedPayload = {
    ...payload,
    capture: {
      html: html ? htmlPath : null,
      screenshot: screenshot ? screenshotPath : null,
      json: jsonPath,
    },
  };

  await Promise.all([
    html ? fs.writeFile(htmlPath, html) : Promise.resolve(),
    screenshot ? fs.writeFile(screenshotPath, screenshot) : Promise.resolve(),
    fs.writeFile(jsonPath, `${JSON.stringify(enrichedPayload, null, 2)}\n`),
  ]).catch(() => {});

  return enrichedPayload;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

    const buttonSelectors = [
      "#button_accept",
      "#button_connect",
      "input[type='submit'][value='Continue to proceed']",
      "input[type='submit'][value='Accept']",
      "input[type='submit'][value='Connect']",
      "input[type='submit'][value='Connect to the internet']",
      "input[type='button'][value='Continue to proceed']",
      "input[type='button'][value='Accept']",
      "input[type='button'][value='Connect']",
      "input[type='button'][value='Connect to the internet']",
      "button:has-text('Continue to proceed')",
      "button:has-text('Connect to the internet')",
      "button:has-text('Accept')",
      "button:has-text('Connect')",
      "button:has-text('Agree')",
      "button:has-text('インターネットに接続')",
      "button:has-text('次へ')",
      "a:has-text('Continue to proceed')",
      "a:has-text('Connect to the internet')",
      "a:has-text('Accept')",
      "a:has-text('Connect')",
      "a:has-text('Agree')",
      "a:has-text('インターネットに接続')",
      "a:has-text('次へ')",
      "button:has-text('同意する')",
      "button:has-text('接続')",
      "a:has-text('同意する')",
      "a:has-text('接続')",
    ];
    const filled = [];
    const clicked = [];

    for (let attempt = 0; attempt < 4; attempt += 1) {
      filled.push(...(await fillUsenDemographics(page)));

      const action = page.locator(buttonSelectors.join(", ")).first();
      const actionVisible = await action.isVisible({ timeout: attempt === 0 ? 12000 : 4000 }).catch(() => false);
      if (!actionVisible) break;

      const label = await action
        .evaluate((el) => el.value || el.innerText || el.textContent || el.getAttribute("aria-label") || "")
        .catch(() => "");
      clicked.push(label.trim() || `button_${attempt + 1}`);
      await action.click({ timeout: 10000 });
      await page.waitForLoadState("domcontentloaded", { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(3000);
    }

    if (clicked.length === 0) {
      const title = await page.title().catch(() => "");
      const text = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
      const debug = await collectDebugState(page);
      const result = await writeCapture(page, {
        result: "no_connect_or_accept_button",
        filled,
        ...debug,
        title,
        sample: text.slice(0, 500),
        url: page.url(),
      });
      console.log(JSON.stringify(result));
      process.exit(2);
    }

    const title = await page.title().catch(() => "");
    const finalUrl = page.url();
    const bodyText = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
    const debug = await collectDebugState(page);
    const result = await writeCapture(page, {
      result: "clicked_portal_buttons",
      filled,
      clicked,
      ...debug,
      title,
      url: finalUrl,
      sample: bodyText.slice(0, 500),
    });
    console.log(JSON.stringify(result));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
