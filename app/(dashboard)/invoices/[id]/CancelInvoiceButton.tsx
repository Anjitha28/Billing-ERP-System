"use client";

import { useState, useTransition } from "react";
import { cancelTaxInvoiceAction } from "../actions";

export function CancelInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }

    startTransition(async () => {
      const res = await cancelTaxInvoiceAction(invoiceId, reason);
      if (res.success) {
        setShowConfirm(false);
      } else {
        setError(res.error);
      }
    });
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-theme-surface border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-900/20 hover:border-red-300 transition-colors"
      >
        Cancel Invoice
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation..."
          className="border border-red-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 w-64"
          disabled={isPending}
        />
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center"
        >
          {isPending ? "Cancelling..." : "Confirm"}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setError(null);
            setReason("");
          }}
          disabled={isPending}
          className="px-3 py-1.5 bg-theme-surface-hover text-theme-text rounded-md text-sm font-medium hover:bg-theme-surface-hover"
        >
          Abort
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
