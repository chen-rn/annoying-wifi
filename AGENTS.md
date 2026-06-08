# Repository Guidelines

## Support Documentation

When adding, removing, or changing support for a captive portal, SSID, portal marker, local API path, or fallback flow, update the user-facing docs in the same change.

Check at least:

- `README.md`: supported SSIDs and behavior summary.
- `web/app/page.tsx`: landing page description and supported SSID list.
- `web/app/CopyAgentPrompt.tsx`: copied install prompt and support summary.

Treat the README and landing page as part of the feature. Do not leave support changes for a later docs-only follow-up.
