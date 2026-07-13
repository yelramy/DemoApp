"use client";

import { useEffect, useState } from "react";

export function QuoteExpiry({ expiresAt }: { expiresAt: string }) {
  const [left, setLeft] = useState("");

  useEffect(() => {
    function tick() {
      const ms = new Date(expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        setLeft("Expired");
        return;
      }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setLeft(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <p className="mt-3 text-xs text-[var(--ink)]/55">
      Quote expires in <strong className="text-[var(--sea-deep)]">{left}</strong> ·
      customs is an estimate
    </p>
  );
}
