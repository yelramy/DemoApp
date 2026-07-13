"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    preferredPayment: "WHISH",
    notifyWhatsApp: true,
    notifyEmail: true,
    notifySms: false,
    kycDocumentUrl: "",
    referralCode: "",
    suiteCode: "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name || "",
            preferredPayment: d.user.preferredPayment || "WHISH",
            notifyWhatsApp: d.user.notifyWhatsApp,
            notifyEmail: d.user.notifyEmail,
            notifySms: d.user.notifySms,
            kycDocumentUrl: d.user.kycDocumentUrl || "",
            referralCode: d.user.referralCode || "",
            suiteCode: d.user.suiteCode || "",
          });
        }
      });
  }, []);

  return (
    <div className="container-bridge py-5 sm:py-10">
      <h1 className="display mb-4 text-2xl text-[var(--sea-deep)] sm:mb-6 sm:text-3xl">Settings</h1>
      <form
        className="panel max-w-xl space-y-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/me", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(form),
          });
          setMsg("Saved");
        }}
      >
        <p className="text-xs text-[var(--ink)]/55">
          Suite {form.suiteCode} · Referral {form.referralCode}
        </p>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
        />
        <select
          className="input"
          value={form.preferredPayment}
          onChange={(e) => setForm({ ...form, preferredPayment: e.target.value })}
        >
          {["WHISH", "COD", "OMT", "CARD"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.notifyWhatsApp}
            onChange={(e) => setForm({ ...form, notifyWhatsApp: e.target.checked })}
          />
          WhatsApp updates
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.notifyEmail}
            onChange={(e) => setForm({ ...form, notifyEmail: e.target.checked })}
          />
          Email updates
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.notifySms}
            onChange={(e) => setForm({ ...form, notifySms: e.target.checked })}
          />
          SMS updates
        </label>
        <input
          className="input"
          placeholder="KYC document URL (high-value orders)"
          value={form.kycDocumentUrl}
          onChange={(e) => setForm({ ...form, kycDocumentUrl: e.target.value })}
        />
        <button className="btn btn-primary w-full" type="submit">
          Save profile
        </button>
        <a className="btn btn-ghost w-full" href="/api/me/export">
          Export my data
        </a>
        <button
          className="btn btn-ghost w-full"
          type="button"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
        >
          Log out
        </button>
        <button
          className="btn btn-ghost w-full text-[var(--danger)]"
          type="button"
          onClick={async () => {
            if (!confirm("Delete/anonymize account?")) return;
            await fetch("/api/me", { method: "DELETE" });
            setMsg("Account anonymized");
          }}
        >
          Delete account
        </button>
        {msg ? <p className="text-sm text-[var(--ok)]">{msg}</p> : null}
      </form>
    </div>
  );
}
