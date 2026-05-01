#!/usr/bin/env node

const { chromium } = require("playwright");

const url = process.argv[2];
if (!url) {
  console.error("missing Wi2 portal URL");
  process.exit(64);
}

const timeout = 20000;

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
      "input[type='submit'][value='Accept']",
      "input[type='submit'][value='Connect']",
      "input[type='button'][value='Accept']",
      "input[type='button'][value='Connect']",
      "button:has-text('Accept')",
      "button:has-text('Connect')",
      "button:has-text('Agree')",
      "a:has-text('Accept')",
      "a:has-text('Connect')",
      "a:has-text('Agree')",
      "button:has-text('同意する')",
      "button:has-text('接続')",
      "a:has-text('同意する')",
      "a:has-text('接続')",
    ];
    const clicked = [];

    for (let attempt = 0; attempt < 4; attempt += 1) {
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
      console.log(JSON.stringify({
        result: "no_connect_or_accept_button",
        title,
        sample: text.slice(0, 500),
        url: page.url(),
      }));
      process.exit(2);
    }

    const title = await page.title().catch(() => "");
    const finalUrl = page.url();
    const bodyText = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
    console.log(JSON.stringify({
      result: "clicked_portal_buttons",
      clicked,
      title,
      url: finalUrl,
      sample: bodyText.slice(0, 500),
    }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
