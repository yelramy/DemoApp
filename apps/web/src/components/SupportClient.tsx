"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  messages: Array<{ id: string; sender: string; body: string }>;
};

export function SupportClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    setSubject("");
    setMessage("");
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={create} className="panel space-y-3 p-6">
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
        <p className="text-xs text-[var(--ink)]/55">
          Also mirrored to WhatsApp sandbox notification log for ops.
        </p>
      </form>
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
