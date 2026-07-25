import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; q?: string; status?: string };
}) {
  await requireAdmin();

  const fromFilter = await Promise.resolve(searchParams.from);
  const toFilter = await Promise.resolve(searchParams.to);
  const searchFilter = await Promise.resolve(searchParams.q);
  const statusFilter = await Promise.resolve(searchParams.status);

  const filters = {
    fromDate: fromFilter ? new Date(fromFilter) : undefined,
    toDate: toFilter ? new Date(toFilter) : undefined,
    search: searchFilter,
    paymentStatus: statusFilter
  };

  const { data: invoices, summary } = await ReportsService.getSalesReport(filters);

  // Flatten data for export
  const exportData = invoices.map(inv => ({
    "Invoice Number": inv.invoiceNumber,
    "Date": inv.invoiceDate.toLocaleDateString('en-IN'),
    "Customer": inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown',
    "GSTIN": inv.gstinSnapshot || inv.customer?.gstin || '',
    "Taxable Amount": Number(inv.taxableAmount),
    "CGST": Number(inv.totalCGST),
    "SGST": Number(inv.totalSGST),
    "IGST": Number(inv.totalIGST),
    "Total GST": Number(inv.totalGST),
    "Total Amount": Number(inv.netAmount),
    "Payment Status": inv.status.replace('_', ' ')
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Sales_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">SALES REPORT</h1>
        <p className="text-center text-gray-600">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Sales</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Taxable</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalTaxableAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total GST</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalGST)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Invoices</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{summary.numberOfInvoices}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Receivables</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.outstandingReceivables)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              name="q"
              defaultValue={searchFilter || ""}
              placeholder="Search invoice or customer..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="status"
              defaultValue={statusFilter || ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="To Date" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
            {(searchFilter || statusFilter || fromFilter || toFilter) && (
              <Link href="/reports/sales" className="bg-white text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-700 border border-gray-300 flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 print:bg-white print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total GST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No invoices found for the selected criteria.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{inv.invoiceDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                      {inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown'}
                      <div className="text-xs text-gray-500">{inv.gstinSnapshot || inv.customer?.gstin || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.taxableAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.totalGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 
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
