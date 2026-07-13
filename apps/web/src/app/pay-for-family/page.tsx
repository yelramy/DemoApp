import Link from "next/link";

export default function PayForFamilyPage() {
  return (
    <div className="container-bridge py-16">
      <div className="panel overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-[linear-gradient(145deg,#0b4f6c,#1a3a2f)] p-8 text-white md:p-12">
            <h1 className="display text-4xl md:text-5xl">Pay for family</h1>
            <p className="mt-4 max-w-md text-white/80">
              Relatives abroad pay with a normal card. Family in Lebanon receives the package —
              remittance that becomes something useful.
            </p>
          </div>
          <div className="p-8 md:p-12">
            <ol className="space-y-4 text-sm">
              <li>
                <strong>1.</strong> Family in Lebanon builds a cart / wishlist.
              </li>
              <li>
                <strong>2.</strong> Bridge sends you a pay link.
              </li>
              <li>
                <strong>3.</strong> You pay. They track delivery to the door.
              </li>
            </ol>
            <Link href="/login" className="btn btn-primary mt-8">
              Create a payer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
