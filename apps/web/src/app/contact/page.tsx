"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  return (
    <div className="container-bridge py-16">
      <div className="panel mx-auto max-w-xl p-8">
        <h1 className="display text-3xl text-[var(--sea-deep)]">Contact</h1>
        <p className="mt-2 text-sm text-[var(--ink)]/65">
          Partnerships, press, or support escalations.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name, email, message }),
            });
            setOk(res.ok);
          }}
        >
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <textarea className="input min-h-28" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
          {ok ? <p className="text-sm text-[var(--ok)]">Received — we’ll reply soon.</p> : null}
        </form>
      </div>
    </div>
  );
}
