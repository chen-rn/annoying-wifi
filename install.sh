#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.${USER}.annoying-wifi"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
APP_DIR="${HOME}/.local/share/annoying-wifi"

mkdir -p "${HOME}/.local/bin"
mkdir -p "${APP_DIR}"
mkdir -p "${HOME}/Library/LaunchAgents"
mkdir -p "${HOME}/Library/Logs"

cp "${ROOT_DIR}/annoying-wifi" "${HOME}/.local/bin/annoying-wifi"
cp "${ROOT_DIR}/annoying-wifi-browser-accept.js" "${APP_DIR}/annoying-wifi-browser-accept.js"
cp "${ROOT_DIR}/package.json" "${APP_DIR}/package.json"
chmod +x "${HOME}/.local/bin/annoying-wifi"
chmod +x "${APP_DIR}/annoying-wifi-browser-accept.js"

# Build a tiny "Annoying WiFi.app" so notifications show a proper name + Wi-Fi
# icon instead of "terminal-notifier". terminal-notifier's -sender impersonates
# this bundle, so it just needs a valid Info.plist + icon registered with
# LaunchServices; the executable is a harmless no-op for when the toast is clicked.
SENDER_ID="com.${USER}.annoyingwifi"
APP_BUNDLE="${APP_DIR}/Annoying WiFi.app"
CONTENTS="${APP_BUNDLE}/Contents"
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Support/lsregister"

rm -rf "${APP_BUNDLE}"
mkdir -p "${CONTENTS}/MacOS" "${CONTENTS}/Resources"

cat > "${CONTENTS}/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Annoying WiFi</string>
  <key>CFBundleDisplayName</key><string>Annoying WiFi</string>
  <key>CFBundleIdentifier</key><string>${SENDER_ID}</string>
  <key>CFBundleVersion</key><string>1.0</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleExecutable</key><string>annoying-wifi-notifier</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>LSUIElement</key><true/>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
</dict>
</plist>
EOF

cat > "${CONTENTS}/MacOS/annoying-wifi-notifier" <<'EOF'
#!/bin/sh
# Clicking a notification activates this app. Open whatever click target the
# launcher recorded for the most recent notification (captive portal page, or
# Accessibility settings for the permission warning).
url=$(cat "${HOME}/Library/Logs/annoying-wifi.click-url" 2>/dev/null)
[ -n "${url}" ] && open "${url}"
exit 0
EOF
chmod +x "${CONTENTS}/MacOS/annoying-wifi-notifier"

if [[ -f "${ROOT_DIR}/assets/icon.png" ]] && command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
  ICONSET="$(mktemp -d)/AppIcon.iconset"
  mkdir -p "${ICONSET}"
  for s in 16 32 128 256 512; do
    sips -z "${s}" "${s}" "${ROOT_DIR}/assets/icon.png" --out "${ICONSET}/icon_${s}x${s}.png" >/dev/null 2>&1 || true
    sips -z "$((s * 2))" "$((s * 2))" "${ROOT_DIR}/assets/icon.png" --out "${ICONSET}/icon_${s}x${s}@2x.png" >/dev/null 2>&1 || true
  done
  iconutil -c icns "${ICONSET}" -o "${CONTENTS}/Resources/AppIcon.icns" >/dev/null 2>&1 || true
  rm -rf "$(dirname "${ICONSET}")"
fi

plutil -lint "${CONTENTS}/Info.plist" >/dev/null 2>&1 || true
[[ -x "${LSREGISTER}" ]] && "${LSREGISTER}" -f "${APP_BUNDLE}" >/dev/null 2>&1 || true

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
    <string>${HOME}/.local/bin/annoying-wifi</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>30</integer>
  <key>StandardOutPath</key>
  <string>${HOME}/Library/Logs/annoying-wifi.out.log</string>
  <key>StandardErrorPath</key>
  <string>${HOME}/Library/Logs/annoying-wifi.err.log</string>
</dict>
</plist>
EOF

plutil -lint "${PLIST}"
launchctl bootout "gui/$(id -u)" "${PLIST}" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "${PLIST}"
launchctl kickstart -k "gui/$(id -u)/${LABEL}"

cat "${HOME}/Library/Logs/annoying-wifi.status" 2>/dev/null || true
