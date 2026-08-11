"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProformaInvoiceStatus } from "@prisma/client";
import { updateProformaInvoiceStatusAction } from "./proforma-actions";

export function ProformaInvoiceClientList({
  initialInvoices,
}: {
  initialInvoices: any[]; // Using any to avoid complex nested Prisma typings inline
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProformaInvoiceStatus | "ALL">("ALL");

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.legalName.toLowerCase().includes(searchLower) ||
      (invoice.customer.tradeName && invoice.customer.tradeName.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ProformaInvoiceStatus) => {
    switch (status) {
      case "DRAFT": return "bg-theme-surface-hover text-theme-text";
      case "SENT": return "bg-theme-surface-hover text-blue-800";
      case "ACCEPTED": return "bg-emerald-100 text-emerald-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "EXPIRED": return "bg-orange-100 text-orange-800";
      case "CANCELLED": return "bg-theme-surface-hover text-theme-text-muted line-through";
      default: return "bg-theme-surface-hover text-theme-text";
    }
  };

  const handleCancel = (id: string) => {
    if (!confirm("Are you sure you want to cancel this proforma invoice?")) return;
    
    startTransition(async () => {
      // Optimistic update
      const prev = [...invoices];
      setInvoices(prev.map(i => i.id === id ? { ...i, status: "CANCELLED" } : i));

      const res = await updateProformaInvoiceStatusAction(id, "CANCELLED");
      if (!res.success) {
        setInvoices(prev);
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Invoice Number or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
          <svg className="w-5 h-5 text-theme-text-muted absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface min-w-[150px]"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-theme-surface-hover border-b border-theme-border text-xs uppercase text-theme-text-muted font-semibold tracking-wider">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-theme-text-muted">
                    No proforma invoices found. Create your first proforma invoice to begin billing.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-theme-surface-hover transition-colors">
                    <td className="px-6 py-4 font-medium text-theme-text">
                      <Link href={`/proforma-invoices/${invoice.id}`} className="hover:text-theme-primary">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-theme-text font-medium">{invoice.customer.legalName}</div>
                      {invoice.customer.gstin && <div className="text-xs text-theme-text-muted mt-0.5">GSTIN: {invoice.customer.gstin}</div>}
                    </td>
                    <td className="px-6 py-4 text-theme-text-muted">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-theme-text-muted">
                      {invoice.validUntil ? new Date(invoice.validUntil).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-theme-text">
                      ₹{invoice.totalAmount.toString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {invoice.status === "DRAFT" && (
                          <Link 
                            href={`/proforma-invoices/${invoice.id}/edit`}
                            className="text-theme-text-muted hover:text-theme-primary font-medium text-xs"
                          >
                            Edit
                          </Link>
                        )}
                        <Link 
                          href={`/proforma-invoices/${invoice.id}`}
                          className="text-theme-text-muted hover:text-theme-primary font-medium text-xs"
                        >
                          View
                        </Link>
                        {invoice.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancel(invoice.id)}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-700 font-medium text-xs disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
