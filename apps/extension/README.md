# Bridge Chrome MV3 extension

1. Open `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `apps/extension`
4. Log into Bridge at `http://localhost:3000`
5. On a product page, click the extension → **Get quote**

Uses the same `/api/quotes` API as the bookmarklet. For production, point `bridgeOrigin` at your deployed domain and ship host permissions accordingly.
