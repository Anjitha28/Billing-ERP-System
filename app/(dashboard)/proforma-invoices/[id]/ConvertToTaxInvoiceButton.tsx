"use client";

import { useState, useTransition } from "react";
import { convertProformaToTaxInvoiceAction } from "@/app/(dashboard)/invoices/actions";
import { useRouter } from "next/navigation";

export function ConvertToTaxInvoiceButton({ proformaId }: { proformaId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConvert = () => {
    setError(null);
    startTransition(async () => {
      const res = await convertProformaToTaxInvoiceAction(proformaId);
      if (res.success && res.data) {
        // Redirect to the newly generated Tax Invoice
        router.push(`/invoices/${res.data.id}`);
      } else {
        setError(res.error || "An error occurred");
        setShowConfirm(false);
      }
    });
  };

  if (!showConfirm) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Convert to Tax Invoice
        </button>
        {error && <p className="text-xs text-red-600 font-medium max-w-xs text-right">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-theme-surface border border-emerald-200 p-4 rounded-xl shadow-sm text-right flex flex-col items-end gap-3 max-w-sm absolute right-4 mt-12 z-50">
      <p className="text-sm text-theme-text font-medium text-left">
        Once confirmed, this invoice becomes a finalized business record and cannot be freely edited. 
        Are you sure all customer, item, and tax details are correct?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          disabled={isPending}
          className="px-3 py-1.5 bg-theme-surface-hover text-gray-200 rounded-md text-sm font-medium hover:bg-theme-surface-hover disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConvert}
          disabled={isPending}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center"
        >
          {isPending ? "Generating..." : "Confirm & Finalize"}
        </button>
      </div>
    </div>
  );
}
