import { CopyAgentPrompt } from "./CopyAgentPrompt";

const REPO_URL = "https://github.com/chen-rn/annoying-wifi";

export default function Home() {
  return (
    <main className="page page-spec theme-divided">
      <article className="paper">
        <header className="paper-head">
          <h1>annoying-wifi</h1>
          <span className="paper-meta">
            macOS ·{" "}
            <a
              className="inline-link"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              github
            </a>
          </span>
        </header>

        <section className="paper-body">
          <p>
            You know how cafe Wi-Fi makes you re-accept the same permission
            screen every hour or so? This does it for you with a small
            background script that clears the portal, so the disconnect is
            invisible.
          </p>
          <p>
            It checks every 30 seconds, notices the Starbucks, DOUTOR, and
            Tully&apos;s/USEN portals through Apple&apos;s hotspot probe, then taps
            the right buttons with headless Chromium or the local portal API.
          </p>
          <p>
            <CopyAgentPrompt className="inline-link" copiedLabel="Copied">
              Click here
            </CopyAgentPrompt>{" "}
            to copy the prompt to pass to your agent.
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
      </article>
    </main>
  );
}
