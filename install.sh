#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.${USER}.auto-wi2-captive-accept"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
APP_DIR="${HOME}/.local/share/auto-wi2-captive-accept"

mkdir -p "${HOME}/.local/bin"
mkdir -p "${APP_DIR}"
mkdir -p "${HOME}/Library/LaunchAgents"
mkdir -p "${HOME}/Library/Logs"

cp "${ROOT_DIR}/auto-wi2-captive-accept" "${HOME}/.local/bin/auto-wi2-captive-accept"
cp "${ROOT_DIR}/auto-wi2-browser-accept.js" "${APP_DIR}/auto-wi2-browser-accept.js"
cp "${ROOT_DIR}/package.json" "${APP_DIR}/package.json"
chmod +x "${HOME}/.local/bin/auto-wi2-captive-accept"
chmod +x "${APP_DIR}/auto-wi2-browser-accept.js"

if command -v npm >/dev/null 2>&1; then
  npm install --prefix "${APP_DIR}"
  npx --prefix "${APP_DIR}" playwright install chromium
else
  echo "npm is required for the Playwright helper" >&2
  exit 1
fi

cat > "${PLIST}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${HOME}/.local/bin/auto-wi2-captive-accept</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>30</integer>
  <key>StandardOutPath</key>
  <string>${HOME}/Library/Logs/auto-wi2-captive-accept.out.log</string>
  <key>StandardErrorPath</key>
  <string>${HOME}/Library/Logs/auto-wi2-captive-accept.err.log</string>
</dict>
</plist>
EOF

plutil -lint "${PLIST}"
launchctl bootout "gui/$(id -u)" "${PLIST}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${PLIST}"
launchctl kickstart -k "gui/$(id -u)/${LABEL}"

cat "${HOME}/Library/Logs/auto-wi2-captive-accept.status" 2>/dev/null || true
