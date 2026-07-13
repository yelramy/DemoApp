"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [target, setTarget] = useState("+96170123456");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mode === "phone" ? { phone: target } : { email: target }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.message ?? "Failed");
      return;
    }
    setSent(true);
    setDemoCode(data.demoCode);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code,
        ...(mode === "phone" ? { phone: target } : { email: target }),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.message ?? "Failed");
      return;
    }
    router.push(data.user?.role === "ADMIN" ? "/admin" : "/app");
    router.refresh();
  }

  return (
    <div className="container-bridge py-16">
      <div className="panel mx-auto max-w-md p-8">
        <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">Log in</h1>
        <p className="mb-6 text-sm text-[var(--ink)]/70">
          Phone OTP for Lebanon. Email OTP for diaspora payers.
        </p>
        <div className="mb-4 flex gap-2">
          <button
            className={`btn text-sm ${mode === "phone" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMode("phone")}
            type="button"
          >
            Phone
          </button>
          <button
            className={`btn text-sm ${mode === "email" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setMode("email");
              setTarget("admin@bridge.lb");
            }}
            type="button"
          >
            Email
          </button>
        </div>
        {!sent ? (
          <form onSubmit={requestOtp} className="space-y-3">
            <input
              className="input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={mode === "phone" ? "+961..." : "you@email.com"}
            />
            <button className="btn btn-primary w-full" type="submit">
              Send code
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            {demoCode ? (
              <p className="rounded-xl bg-[var(--foam)] p-3 text-sm">
                Sandbox code: <strong>{demoCode}</strong>
              </p>
            ) : null}
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter OTP"
            />
            <button className="btn btn-primary w-full" type="submit">
              Verify
            </button>
          </form>
        )}
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
      </div>
    </div>
  );
}
