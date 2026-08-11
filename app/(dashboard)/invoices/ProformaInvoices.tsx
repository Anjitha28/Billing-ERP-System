import Link from "next/link";
import { ProformaInvoiceService } from "@/services/proforma-invoice.service";
import { ProformaInvoiceClientList } from "./ProformaInvoiceClientList";

export async function ProformaInvoices() {
  const invoices = await ProformaInvoiceService.getProformaInvoices();

  // Summary Cards Data
  const totalItems = invoices.length;
  const draftItems = invoices.filter(i => i.status === "DRAFT").length;
  const sentItems = invoices.filter(i => i.status === "SENT").length;
  const acceptedItems = invoices.filter(i => i.status === "ACCEPTED").length;
  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <Link
          href="/proforma-invoices/new"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-theme-primary hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Proforma Invoice
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-theme-text-muted uppercase tracking-wide">Total Items</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{totalItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-theme-text-muted uppercase tracking-wide">Draft</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{draftItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">Sent</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{sentItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-emerald-500 uppercase tracking-wide">Accepted</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{acceptedItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide">Total Value</p>
          <p className="mt-2 text-xl font-bold text-theme-text">₹{totalValue.toFixed(2)}</p>
        </div>
      </div>

      <ProformaInvoiceClientList initialInvoices={invoices} />
    </div>
  );
}
