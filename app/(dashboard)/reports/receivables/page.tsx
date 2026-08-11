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
        <h1 className="text-2xl font-bold text-theme-text">Receivables</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Receivables_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">RECEIVABLES REPORT</h1>
        <p className="text-center text-theme-text-muted">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-theme-primary print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Receivables</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalReceivables)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Paid Amount</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.paidAmount)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-orange-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Outstanding Amount</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.outstandingAmount)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-red-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Unpaid Invoices</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{summary.numberOfUnpaidInvoices}</p>
        </div>
      </div>

      <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="To Date" />
            <button type="submit" className="bg-theme-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-primary-dark">Filter</button>
            {(fromFilter || toFilter) && (
              <Link href="/reports/receivables" className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-200 border border-theme-border flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-surface-hover print:bg-theme-surface print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Dates</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Outstanding</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-theme-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-theme-text-muted">No outstanding receivables found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-theme-surface-hover">
                    <td className="px-4 py-3 text-sm text-theme-text max-w-[200px] truncate">
                      {inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-theme-primary">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">
                      <div>Inv: {inv.invoiceDate.toLocaleDateString('en-IN')}</div>
                      <div className={new Date(inv.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000) < new Date() ? 'text-red-600 font-medium' : 'text-theme-text-muted'}>
                        Due: {new Date(inv.invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(0)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-orange-600">{formatCurrency(Number(inv.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
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
