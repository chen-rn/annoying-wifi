# auto-wi2-captive-accept

macOS LaunchAgent scripts for automatically accepting Wi2 captive portals used by DOUTOR and Starbucks.

Supported SSIDs:

- `DOUTOR_FREE_Wi-Fi`
- `at_STARBUCKS_Wi2`
- `Wi2_Free`
- `Wi2free`
- `Wi2`

The launcher runs every 30 seconds, checks `http://captive.apple.com/hotspot-detect.html`, and tries to clear the Wi2 portal with a headless Playwright helper. If that fails, it opens Captive Network Assistant and uses AppleScript to click portal buttons. Starbucks is handled as a two-step flow: `Connect`, then `Accept`.

## Install

```sh
./install.sh
```

Logs and status:

```sh
cat "$HOME/Library/Logs/auto-wi2-captive-accept.status"
tail -n 80 "$HOME/Library/Logs/auto-wi2-captive-accept.log"
```

## Uninstall

```sh
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.$USER.auto-wi2-captive-accept.plist"
rm -f "$HOME/Library/LaunchAgents/com.$USER.auto-wi2-captive-accept.plist"
rm -f "$HOME/.local/bin/auto-wi2-captive-accept"
rm -rf "$HOME/.local/share/auto-wi2-captive-accept"
```
