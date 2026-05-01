import { CopyAgentPrompt } from "./CopyAgentPrompt";

const REPO_URL = "https://github.com/chen-rn/auto-wi2-captive-accept";
const ZIP_URL = `${REPO_URL}/archive/refs/heads/main.zip`;

export default function Home() {
  return (
    <main className="page">
      <header className="brand-mark">
        <a className="brand-link" href="/">
          <span className="brand-name">Wi2 Auto-Accept</span>
        </a>
      </header>

      <aside className="repo-mark">
        <a className="repo-link" href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </aside>

      <section className="hero">
        <div className="hero-inner">
          <h1 className="title">
            Stop clicking the Wi2 portal at every café.
          </h1>
          <p className="lede">
            A small macOS LaunchAgent that watches for Wi2 captive portals and
            auto-accepts them in the background — so your Mac just connects.
          </p>

          <div className="actions">
            <a className="action-link primary" href={ZIP_URL}>
              Download
            </a>
            <CopyAgentPrompt />
          </div>

          <p className="note">
            Works for{" "}
            <span className="ssid">DOUTOR_FREE_Wi-Fi</span> and{" "}
            <span className="ssid">at_STARBUCKS_Wi2</span> at the moment. Other
            Wi2 networks may work — no guarantees.
          </p>
        </div>
      </section>

      <footer className="footer">
        <span className="footer-copy">
          © {new Date().getFullYear()} auto-wi2-captive-accept
        </span>
        <nav className="footer-links">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            Source
          </a>
          <a
            href={`${REPO_URL}/blob/main/README.md`}
            target="_blank"
            rel="noreferrer"
          >
            Readme
          </a>
        </nav>
      </footer>
    </main>
  );
}
