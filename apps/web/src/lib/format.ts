export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  quoted: "Quoted",
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  buy_in_progress: "Buying item",
  purchased: "Purchased abroad",
  awaiting_inbound: "Heading to hub",
  received_at_hub: "At UAE hub",
  on_hold_hub: "Hold at hub",
  consolidated: "Packed for Lebanon",
  in_transit_to_lebanon: "In transit to Lebanon",
  customs_clearance: "Customs clearance",
  customs_hold: "Customs hold",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refund_pending: "Refund pending",
  refunded: "Refunded",
  claim_open: "Claim open",
  claim_resolved: "Claim resolved",
  failed: "Failed",
};
