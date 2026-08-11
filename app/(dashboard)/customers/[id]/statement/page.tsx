import { requireAuth } from '@/lib/auth-utils';
import { CustomerService } from '@/services/customer.service';
import { TaxInvoiceService } from '@/services/tax-invoice.service';
import { ProformaInvoiceService } from '@/services/proforma-invoice.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CustomerStatementPage({ params }: { params: { id: string } }) {
  await requireAuth();

  const customerId = (await Promise.resolve(params)).id;
  
  const customer = await CustomerService.getCustomerById(customerId);
  if (!customer) {
    notFound();
  }

  const [taxInvoices, proformaInvoices] = await Promise.all([
    TaxInvoiceService.getTaxInvoices({ customerId }),
    ProformaInvoiceService.getProformaInvoices({ customerId })
  ]);

  const totalBilled = taxInvoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const totalPaid = taxInvoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const outstandingAmount = totalBilled - totalPaid;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Statement of Account</h1>
          <p className="text-theme-text-muted mt-1">{customer.legalName}</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/customers/${customerId}`} 
            className="px-4 py-2 bg-theme-surface text-theme-text border border-theme-border rounded-lg text-sm font-medium hover:bg-theme-surface-hover"
          >
            Back to Customer
          </Link>
          <button 
            className="px-4 py-2 bg-theme-primary text-white rounded-lg text-sm font-medium hover:bg-theme-primary-dark"
            style={{ '@media print': { display: 'none' } } as any}
            // A simple JS print on click
          >
            Print Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-theme-surface p-6 rounded-xl shadow-sm border border-theme-border">
          <p className="text-sm font-medium text-theme-text-muted">Total Billed</p>
          <p className="text-2xl font-bold text-theme-text mt-2">₹{totalBilled.toFixed(2)}</p>
        </div>
        <div className="bg-theme-surface p-6 rounded-xl shadow-sm border border-theme-border border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-theme-text-muted">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-theme-surface p-6 rounded-xl shadow-sm border border-theme-border border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-theme-text-muted">Outstanding Balance</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{outstandingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover">
          <h2 className="text-lg font-bold text-theme-text">Tax Invoices</h2>
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
              {taxInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-theme-text-muted">No tax invoices found.</td>
                </tr>
              ) : (
                taxInvoices.map(inv => (
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

      <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden mt-6">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover">
          <h2 className="text-lg font-bold text-theme-text">Proforma Invoices (Draft/Estimates)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-theme-border text-xs uppercase text-theme-text-muted font-semibold bg-theme-surface-hover">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Proforma #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {proformaInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-theme-text-muted">No proforma invoices found.</td>
                </tr>
              ) : (
                proformaInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-theme-surface-hover">
                    <td className="px-6 py-4 text-sm text-theme-text">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-theme-primary">
                      <Link href={`/proforma-invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-theme-text font-medium">₹{Number(inv.netAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                        inv.status === 'ACCEPTED' ? 'bg-theme-surface-hover text-blue-800' :
                        'bg-theme-surface-hover text-theme-text'
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
