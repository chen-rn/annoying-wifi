import { CopyAgentPrompt } from "./CopyAgentPrompt";

const REPO_URL = "https://github.com/chen-rn/auto-wi2-captive-accept";
const ZIP_URL = `${REPO_URL}/archive/refs/heads/main.zip`;

export default function Home() {
  return (
    <main className="page">
      <section className="block">
        <p className="lede">
          A macOS background script that auto-accepts Wi2 captive portals, so
          your Mac just connects.
        </p>

        <div className="actions">
          <a className="action-link" href={ZIP_URL}>
            Download
          </a>
          <CopyAgentPrompt />
        </div>

        <p className="note">
          Works for DOUTOR and Starbucks. No guarantees elsewhere.
        </p>
      </section>
    </main>
  );
}
