import Link from "next/link";
import { TaxInvoiceService } from "@/services/tax-invoice.service";
import { TaxInvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function TaxInvoicesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: TaxInvoiceStatus };
}) {
  const query = searchParams.q || "";
  const statusFilter = searchParams.status;

  const [invoices, metrics] = await Promise.all([
    TaxInvoiceService.getTaxInvoices({ search: query, status: statusFilter }),
    TaxInvoiceService.getDashboardMetrics()
  ]);

  const getStatusColor = (status: TaxInvoiceStatus) => {
    switch (status) {
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "PAID": return "bg-emerald-100 text-emerald-800";
      case "PARTIALLY_PAID": return "bg-orange-100 text-orange-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">Manage confirmed business records and tax invoices.</p>
        </div>
        <Link 
          href="/proforma-invoices/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Create Proforma
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.confirmedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{metrics.cancelledCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{metrics.totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form className="flex-1 w-full max-w-md flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by invoice number or customer..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Search
            </button>
          </form>

          <div className="flex gap-2 text-sm">
            <Link href={`/invoices?q=${query}`} className={`px-3 py-1.5 rounded-lg border ${!statusFilter ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              All
            </Link>
            <Link href={`/invoices?status=CONFIRMED&q=${query}`} className={`px-3 py-1.5 rounded-lg border ${statusFilter === 'CONFIRMED' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Confirmed
            </Link>
            <Link href={`/invoices?status=PAID&q=${query}`} className={`px-3 py-1.5 rounded-lg border ${statusFilter === 'PAID' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Paid
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-3">Invoice Number</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Net Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No tax invoices found. Convert a Proforma Invoice to create one.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{invoice.customerNameSnapshot}</p>
                      {invoice.businessNameSnapshot && (
                        <p className="text-xs text-gray-500">{invoice.businessNameSnapshot}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-gray-900">₹{invoice.netAmount.toString()}</p>
                      {Number(invoice.tdsAmount) > 0 && (
                        <p className="text-xs text-red-500">inc. TDS</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-gray-600 hover:text-blue-600 font-medium"
                      >
                        View Details
                      </Link>
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
