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
          <h1 className="text-2xl font-bold text-gray-900">Statement of Account</h1>
          <p className="text-gray-500 mt-1">{customer.legalName}</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/customers/${customerId}`} 
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Back to Customer
          </Link>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            style={{ '@media print': { display: 'none' } } as any}
            // A simple JS print on click
          >
            Print Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Billed</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalBilled.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
          <p className="text-sm font-medium text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">₹{outstandingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Tax Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold bg-gray-50">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No tax invoices found.</td>
                </tr>
              ) : (
                taxInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">₹{Number(inv.netAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        inv.status === 'CANCELLED' ? 'bg-gray-100 text-gray-600' :
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Proforma Invoices (Draft/Estimates)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold bg-gray-50">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Proforma #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proformaInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No proforma invoices found.</td>
                </tr>
              ) : (
                proformaInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      <Link href={`/proforma-invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">₹{Number(inv.netAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'CONVERTED' ? 'bg-purple-100 text-purple-800' :
                        inv.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
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
