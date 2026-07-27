"use client";

import { useTransition, useState } from "react";
import { updateLedgerPaymentStatusAction } from "./ledger-actions";
import { PaymentStatus } from "@prisma/client";

export function RevenueActions({ 
  txnId, 
  currentStatus 
}: { 
  txnId: string;
  currentStatus: PaymentStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = (status: PaymentStatus) => {
    setIsOpen(false);
    startTransition(async () => {
      const res = await updateLedgerPaymentStatusAction(txnId, status);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="text-gray-500 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
            {currentStatus !== "UNPAID" && (
              <button
                onClick={() => handleStatusChange("UNPAID")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as Unpaid
              </button>
            )}
            {currentStatus !== "PARTIALLY_PAID" && (
              <button
                onClick={() => handleStatusChange("PARTIALLY_PAID")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as Partially Paid
              </button>
            )}
            {currentStatus !== "PAID" && (
              <button
                onClick={() => handleStatusChange("PAID")}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark as Paid
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
