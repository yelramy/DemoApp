document.getElementById("go").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  const bridgeOrigin = "http://localhost:3000";
  const res = await fetch(`${bridgeOrigin}/api/quotes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url: tab.url }),
  });
  const data = await res.json();
  if (data.quoteId) {
    chrome.tabs.create({ url: `${bridgeOrigin}/app/quote/${data.quoteId}` });
  } else {
    alert(data.error?.message || "Quote failed — log into Bridge first");
  }
});
