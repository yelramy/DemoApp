"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton(props: {
  title: string;
  url: string;
  imageUrl?: string | null;
  priceUsd: number;
  weightKg: number;
  hub: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn-ghost mt-3 w-full"
      type="button"
      onClick={async () => {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: props.title,
            url: props.url,
            imageUrl: props.imageUrl,
            priceUsd: props.priceUsd,
            estimatedWeightKg: props.weightKg,
            hub: props.hub,
          }),
        });
        setDone(true);
        router.refresh();
      }}
    >
      {done ? "Added — open cart" : "Add to multi-item cart"}
    </button>
  );
}
