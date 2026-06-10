# auto-wi2-captive-accept

macOS LaunchAgent scripts for automatically accepting captive portals used by DOUTOR, Starbucks, and Tully's/USEN.

Supported SSIDs:

- `DOUTOR_FREE_Wi-Fi`
- `at_STARBUCKS_Wi2`
- `Wi2_Free`
- `Wi2free`
- `Wi2`
- `tullys_Wi-Fi`

The launcher runs every 30 seconds, checks `http://captive.apple.com/hotspot-detect.html`, and tries to clear supported captive portals with a headless Playwright helper. It identifies supported portals from the captive response first, using Wi2/USEN/DOUTOR/Starbucks/Tully's markers such as `service.wi2.ne.jp`, `10.1.1.100`, `USEN Free Wi-Fi`, and `tullys_Wi-Fi`; SSID and known client IP ranges are only fallback hints. On target-like networks it also requires a general internet probe to pass, because Tully's/USEN can allow Apple's success page before the wider internet works. If browser automation fails, it opens Captive Network Assistant and uses AppleScript to click portal buttons. Starbucks is handled as a two-step flow: `Connect`, then `Accept`. Tully's/USEN local portals are submitted directly to the `USPOT-02` local API first because the JavaScript app can render blank in headless Chromium; if that API path fails, the launcher falls back to the native popup flow.

## Notifications

When a portal is detected you get a single, grouped notification that updates in place:

- **Connecting to Wi-Fi…** — clearing the captive portal (silent)
- **Wi-Fi Connected** — portal cleared automatically (Glass)
- **Wi-Fi needs a hand** — could not finish automatically, with the reason (Basso)

`install.sh` builds a small `Wi2 Auto-Connect.app` (under `~/.local/share/auto-wi2-captive-accept/`) and registers it with LaunchServices, so `terminal-notifier` shows a proper **Wi2 Auto-Connect** name and Wi-Fi icon instead of "terminal-notifier". The icon is generated from [`assets/icon.svg`](assets/icon.svg). Without `terminal-notifier` installed, it falls back to a plain `osascript` notification.

Optional overrides can be placed in `~/.config/auto-wi2-captive-accept/config`:

```sh
AUTO_WI2_BIRTH_YEAR=1990
AUTO_WI2_GENDER=Male
```

## Install

```sh
./install.sh
```

Logs and status:

```sh
cat "$HOME/Library/Logs/auto-wi2-captive-accept.status"
tail -n 80 "$HOME/Library/Logs/auto-wi2-captive-accept.log"
cat "$HOME/Library/Logs/auto-wi2-captive-accept.last-browser-result.json"
open "$HOME/Library/Logs/auto-wi2-captive-accept-captures"
```

## Uninstall

```sh
launchctl bootout "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.$USER.auto-wi2-captive-accept.plist"
rm -f "$HOME/Library/LaunchAgents/com.$USER.auto-wi2-captive-accept.plist"
rm -f "$HOME/.local/bin/auto-wi2-captive-accept"
rm -rf "$HOME/.local/share/auto-wi2-captive-accept"
```
