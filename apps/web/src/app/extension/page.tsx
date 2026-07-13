"use client";

export default function ExtensionPage() {
  const bookmarklet = `javascript:void((()=>{fetch('/api/quotes',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({url:location.href})}).then(r=>r.json()).then(d=>{if(d.quoteId)location.href='/app/quote/'+d.quoteId;else alert((d.error&&d.error.message)||'Bridge quote failed');});})())`;

  return (
    <div className="container-bridge py-10">
      <div className="panel max-w-3xl p-8">
        <h1 className="display text-4xl text-[var(--sea-deep)]">Add to Bridge</h1>
        <p className="mt-3 text-sm text-[var(--ink)]/70">
          Drag this bookmarklet to your bookmarks bar. On Amazon/Noon product pages, click it to
          open a Bridge quote (you must be logged in).
        </p>
        <a className="btn btn-primary mt-6 inline-flex" href={bookmarklet}>
          Bridge quote
        </a>
        <p className="mt-4 text-xs text-[var(--ink)]/55">
          Full Chrome MV3 extension can wrap this same API; bookmarklet covers Phase 5.
        </p>
      </div>
    </div>
  );
}
