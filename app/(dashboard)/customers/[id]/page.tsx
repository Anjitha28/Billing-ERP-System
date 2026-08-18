import { CustomerService } from "@/services/customer.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaxInvoiceService } from "@/services/tax-invoice.service";
export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const customer = await CustomerService.getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const taxInvoices = await TaxInvoiceService.getTaxInvoices({ customerId: id });
  
  const totalRevenue = taxInvoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const totalPaid = taxInvoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const outstandingBalance = totalRevenue - totalPaid;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <Link href="/customers" className="mb-2 inline-flex items-center text-sm font-medium text-theme-primary hover:text-theme-primary-dark">
        ← Back to Customers
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">{customer.legalName}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${customer.customerType === 'B2B' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
              {customer.customerType}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${customer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {customer.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-theme-text-muted">
              Added on {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/customers/${customer.id}/statement`}
            className="inline-flex items-center justify-center px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text text-sm font-medium rounded-lg border border-theme-border transition-colors gap-2"
          >
            View Statement
          </Link>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex items-center justify-center px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover text-theme-text text-sm font-medium rounded-lg border border-theme-border transition-colors gap-2"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-theme-text border-b pb-3 mb-4">Customer Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              {customer.tradeName && (
                <div>
                  <span className="block text-theme-text-muted mb-1">Trade Name</span>
                  <span className="text-theme-text font-medium">{customer.tradeName}</span>
                </div>
              )}
              {customer.gstin && (
                <div>
                  <span className="block text-theme-text-muted mb-1">GSTIN</span>
                  <span className="text-theme-text font-medium">{customer.gstin}</span>
                </div>
              )}
              {customer.pan && (
                <div>
                  <span className="block text-theme-text-muted mb-1">PAN</span>
                  <span className="text-theme-text font-medium">{customer.pan}</span>
                </div>
              )}
              <div>
                <span className="block text-theme-text-muted mb-1">Email</span>
                <span className="text-theme-text font-medium">{customer.email || "-"}</span>
              </div>
              <div>
                <span className="block text-theme-text-muted mb-1">Phone</span>
                <span className="text-theme-text font-medium">{customer.phone || "-"}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-theme-text border-b pb-3 mt-8 mb-4">Billing Address</h3>
            <div className="text-sm text-theme-text space-y-1">
              <p>{customer.address || "No address provided."}</p>
              {(customer.city || customer.pinCode) && (
                <p>{[customer.city, customer.pinCode].filter(Boolean).join(" - ")}</p>
              )}
              {(customer.state || customer.country) && (
                <p>
                  {[customer.state, customer.country].filter(Boolean).join(", ")}
                  {customer.stateCode && ` (Code: ${customer.stateCode})`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-orange-700 text-sm font-medium mb-2">Outstanding Balance</h4>
            <span className="text-3xl font-bold text-orange-900">₹{outstandingBalance.toFixed(2)}</span>
          </div>
          
          <div className="bg-theme-surface-hover border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-green-700 text-sm font-medium mb-2">Total Billed</h4>
            <span className="text-3xl font-bold text-green-900">₹{totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text">Recent Invoices</h3>
          <Link href={`/customers/${customer.id}/statement`} className="text-sm font-medium text-theme-primary hover:text-blue-800">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme-border text-xs uppercase text-theme-text-muted font-semibold bg-theme-surface-hover">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {taxInvoices.slice(0, 5).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-theme-text-muted">No recent invoices.</td>
                </tr>
              ) : (
                taxInvoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="hover:bg-theme-surface-hover">
                    <td className="px-6 py-4 text-sm text-theme-text">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-theme-primary">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-theme-text font-medium">₹{Number(inv.netAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        inv.status === 'CANCELLED' ? 'bg-theme-surface-hover text-theme-text-muted' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {inv.status}
                      </span>
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
