"use client";

import { useEffect, useState } from "react";

type Address = {
  id: string;
  label: string;
  city: string;
  area: string;
  street: string;
  isDefault: boolean;
};

export function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    city: "Beirut",
    area: "Achrafieh",
    street: "",
  });

  async function load() {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    setAddresses(data.addresses || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="panel space-y-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/addresses", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ ...form, isDefault: true }),
          });
          load();
        }}
      >
        <h2 className="display text-xl">Add address</h2>
        {Object.entries(form).map(([k, v]) => (
          <input
            key={k}
            className="input"
            placeholder={k}
            value={v}
            onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
            required={k !== "label"}
          />
        ))}
        <button className="btn btn-primary" type="submit">
          Save
        </button>
      </form>
      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="panel p-4 text-sm">
            <strong>{a.label}</strong>
            {a.isDefault ? " · default" : ""}
            <p>
              {a.street}, {a.area}, {a.city}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
