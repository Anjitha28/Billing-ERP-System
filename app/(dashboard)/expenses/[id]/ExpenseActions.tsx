"use client";

import { useState, useTransition } from "react";
import { approveExpenseAction, cancelExpenseAction, updatePaymentStatusAction } from "../actions";
import { PaymentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

export function ExpenseActions({ expenseId, status, paymentStatus }: { expenseId: string; status: string; paymentStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this expense? This action cannot be reversed, and the expense will become a permanent financial record.")) {
      startTransition(async () => {
        await approveExpenseAction(expenseId);
        router.refresh();
      });
    }
  };

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await cancelExpenseAction(expenseId, cancelReason);
      setShowCancelModal(false);
      router.refresh();
    });
  };

  const handlePaymentStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as PaymentStatus;
    if (confirm(`Are you sure you want to mark this expense as ${newStatus.replace("_", " ")}?`)) {
      startTransition(async () => {
        await updatePaymentStatusAction(expenseId, newStatus);
        router.refresh();
      });
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {status === "DRAFT" && (
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-4 py-2 bg-theme-primary text-white rounded-lg text-sm font-medium hover:bg-theme-primary-dark disabled:opacity-50"
        >
          {isPending ? "Processing..." : "Approve Expense"}
        </button>
      )}

      {status === "APPROVED" && (
        <select
          value={paymentStatus}
          onChange={handlePaymentStatus}
          disabled={isPending}
          className="px-4 py-2 border border-theme-border rounded-lg text-sm font-medium bg-theme-surface hover:bg-theme-surface-hover focus:ring-2 focus:ring-theme-primary disabled:opacity-50"
        >
          <option value="UNPAID">Mark as Unpaid</option>
          <option value="PARTIALLY_PAID">Mark as Partially Paid</option>
          <option value="PAID">Mark as Paid</option>
        </select>
      )}

      {status !== "CANCELLED" && paymentStatus !== "PAID" && (
        <button
          onClick={() => setShowCancelModal(true)}
          disabled={isPending}
          className="px-4 py-2 border border-red-200 bg-red-900/20 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
        >
          Cancel Expense
        </button>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-theme-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-theme-border">
              <h3 className="text-lg font-bold text-theme-text">Cancel Expense</h3>
              <p className="text-sm text-theme-text-muted mt-1">Please provide a reason for cancellation.</p>
            </div>
            
            <form onSubmit={handleCancel} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">Reason</label>
                <textarea
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full border border-theme-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary focus:border-theme-primary"
                  placeholder="e.g. Duplicate entry, amount incorrect..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-theme-border bg-theme-surface text-gray-200 rounded-lg text-sm font-medium hover:bg-theme-surface-hover"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending || !cancelReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
