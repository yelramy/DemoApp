"use client";

import { useEffect, useState } from "react";

export function SupportClient() {
  const [tickets, setTickets] = useState<
    Array<{
      id: string;
      subject: string;
      status: string;
      messages: Array<{ id: string; sender: string; body: string }>;
    }>
  >([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [botQ, setBotQ] = useState("where is my order?");
  const [botA, setBotA] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/tickets", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ subject, message }),
            });
            setSubject("");
            setMessage("");
            load();
          }}
          className="panel space-y-3 p-6"
        >
          <h2 className="display text-xl">New ticket</h2>
          <input
            className="input"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            className="input min-h-28"
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </form>
        <form
          className="panel space-y-3 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/support/bot", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ message: botQ }),
            });
            const d = await res.json();
            setBotA(d.reply);
          }}
        >
          <h2 className="display text-xl">Quick bot</h2>
          <input className="input" value={botQ} onChange={(e) => setBotQ(e.target.value)} />
          <button className="btn btn-ghost" type="submit">
            Ask
          </button>
          {botA ? <p className="rounded-xl bg-[var(--foam)] p-3 text-sm">{botA}</p> : null}
        </form>
      </div>
      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="panel p-5">
            <p className="font-semibold">{t.subject}</p>
            <p className="text-xs uppercase text-[var(--sea)]">{t.status}</p>
            <div className="mt-3 space-y-2 text-sm">
              {t.messages.map((m) => (
                <p key={m.id}>
                  <strong>{m.sender}:</strong> {m.body}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
