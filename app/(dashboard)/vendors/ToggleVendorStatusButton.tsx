"use client";

import { useTransition } from "react";
import { toggleVendorStatusAction } from "./actions";

export function ToggleVendorStatusButton({ 
  vendorId, 
  isActive 
}: { 
  vendorId: string; 
  isActive: boolean 
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleVendorStatusAction(vendorId, !isActive);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-red-900/20 text-red-600 hover:bg-red-100 border border-red-200"
          : "bg-theme-surface-hover text-green-600 hover:bg-green-100 border border-green-200"
      } disabled:opacity-50`}
    >
      {isPending ? "Updating..." : isActive ? "Deactivate Vendor" : "Activate Vendor"}
    </button>
  );
}
