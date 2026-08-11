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
        <h1 className="text-2xl font-bold text-theme-text">Sales Report</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Sales_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">SALES REPORT</h1>
        <p className="text-center text-theme-text-muted">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-theme-primary print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Sales</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalSales)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-indigo-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Taxable</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalTaxableAmount)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total GST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalGST)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Invoices</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{summary.numberOfInvoices}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-orange-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Receivables</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.outstandingReceivables)}</p>
        </div>
      </div>

      <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              name="q"
              defaultValue={searchFilter || ""}
              placeholder="Search invoice or customer..."
              className="flex-1 border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            <select
              name="status"
              defaultValue={statusFilter || ""}
              className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
            >
              <option value="">All Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
            </select>
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="To Date" />
            <button type="submit" className="bg-theme-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-primary-dark">Filter</button>
            {(searchFilter || statusFilter || fromFilter || toFilter) && (
              <Link href="/reports/sales" className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-200 border border-theme-border flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-surface-hover print:bg-theme-surface print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Total GST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-theme-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-theme-text-muted">No invoices found for the selected criteria.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-theme-surface-hover">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-theme-primary">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">{inv.invoiceDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-theme-text max-w-[200px] truncate">
                      {inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown'}
                      <div className="text-xs text-theme-text-muted">{inv.gstinSnapshot || inv.customer?.gstin || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(inv.taxableAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(inv.totalGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-theme-text">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                        inv.status === 'PARTIALLY_PAID' ? 'bg-theme-surface-hover text-blue-800' : 'bg-yellow-100 text-yellow-800'
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
