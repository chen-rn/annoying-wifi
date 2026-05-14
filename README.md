# auto-wi2-captive-accept

macOS LaunchAgent scripts for automatically accepting captive portals used by DOUTOR, Starbucks, and Tully's/USEN.

Supported SSIDs:

- `DOUTOR_FREE_Wi-Fi`
- `at_STARBUCKS_Wi2`
- `Wi2_Free`
- `Wi2free`
- `Wi2`
- `tullys_Wi-Fi`

The launcher runs every 30 seconds, checks `http://captive.apple.com/hotspot-detect.html`, and tries to clear the captive portal with a headless Playwright helper. If that fails, it opens Captive Network Assistant and uses AppleScript to click portal buttons. Starbucks is handled as a two-step flow: `Connect`, then `Accept`. Tully's/USEN is handled as a two-step flow: fill `Birth Year` with `1990` and `Gender` with `Male`, click `Continue to proceed`, then click `Connect to the internet`.

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
