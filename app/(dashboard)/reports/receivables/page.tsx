import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function ReceivablesReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  await requireAdmin();

  const fromFilter = await Promise.resolve(searchParams.from);
  const toFilter = await Promise.resolve(searchParams.to);

  const filters = {
    fromDate: fromFilter ? new Date(fromFilter) : undefined,
    toDate: toFilter ? new Date(toFilter) : undefined,
  };

  const { data: invoices, summary } = await ReportsService.getReceivablesReport(filters);

  // Flatten data for export
  const exportData = invoices.map(inv => ({
    "Customer": inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown',
    "Invoice Number": inv.invoiceNumber,
    "Invoice Date": inv.invoiceDate.toLocaleDateString('en-IN'),
    "Due Date": new Date(inv.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    "Invoice Amount": Number(inv.netAmount),
    "Paid Amount": 0,
    "Outstanding Amount": Number(inv.netAmount),
    "Payment Status": inv.status.replace('_', ' ')
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Receivables</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Receivables_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">RECEIVABLES REPORT</h1>
        <p className="text-center text-gray-600">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Receivables</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalReceivables)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Paid Amount</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.paidAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Outstanding Amount</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.outstandingAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Unpaid Invoices</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{summary.numberOfUnpaidInvoices}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="To Date" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
            {(fromFilter || toFilter) && (
              <Link href="/reports/receivables" className="bg-white text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-700 border border-gray-300 flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 print:bg-white print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No outstanding receivables found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                      {inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div>Inv: {inv.invoiceDate.toLocaleDateString('en-IN')}</div>
                      <div className={new Date(inv.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        Due: {new Date(inv.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(0)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-orange-600">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        inv.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      } print:border print:border-gray-400 print:bg-transparent`}>
                        {inv.status.replace('_', ' ')}
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
