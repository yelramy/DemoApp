# Bridge browser extension

Phase 5 ships a **bookmarklet** at `/extension` that POSTs the current page URL to `/api/quotes`.

## Future MV3 package
```
apps/extension/
  manifest.json
  background.js
  content.js
```
Use the same quote API with extension auth cookies or a device token.

For now, bookmarklet covers “Add to Bridge” without a Chrome Web Store release.
