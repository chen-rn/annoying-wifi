import { CopyAgentPrompt } from "./CopyAgentPrompt";

const REPO_URL = "https://github.com/chen-rn/auto-wi2-captive-accept";

export default function Home() {
  return (
    <main className="page page-spec theme-divided">
      <article className="paper">
        <header className="paper-head">
          <h1>wi2-auto-accept</h1>
          <span className="paper-meta">macOS · LaunchAgent · Playwright</span>
        </header>

        <section className="paper-body">
          <p>
            Wi2 captive portals used by Starbucks, DOUTOR, and Tully&apos;s/USEN
            can kick you back to an accept screen. This is a small background
            script that clears the portal for you, so the disconnect is
            invisible.
          </p>
          <p>
            It runs every 30 seconds, detects the portal via Apple&apos;s
            hotspot probe, and uses a headless Chromium or local portal API to
            tap the right buttons.
          </p>
        </section>

        <section className="paper-row">
          <span className="row-key">supports</span>
          <span className="row-val">
            <code>DOUTOR_FREE_Wi-Fi</code>
            <code>at_STARBUCKS_Wi2</code>
            <code>Wi2_Free</code>
            <code>Wi2free</code>
            <code>Wi2</code>
            <code>tullys_Wi-Fi</code>
          </span>
        </section>

        <section className="paper-row">
          <span className="row-key">install</span>
          <span className="row-val">
            <CopyAgentPrompt className="inline-link" copiedLabel="Copied">
              copy prompt for your agent
            </CopyAgentPrompt>
          </span>
        </section>

        <section className="paper-row">
          <span className="row-key">source</span>
          <span className="row-val">
            <a
              className="inline-link"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              github.com/chen-rn/auto-wi2-captive-accept
            </a>
          </span>
        </section>

        <section className="paper-row">
          <span className="row-key">contribute</span>
          <span className="row-val">
            another network?{" "}
            <a
              className="inline-link"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              send a PR
            </a>
          </span>
        </section>
      </article>
    </main>
  );
}
