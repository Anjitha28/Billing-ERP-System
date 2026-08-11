import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function ExpenseReportPage({
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

  const { data: expenses, summary } = await ReportsService.getExpenseReport(filters);

  // Flatten data for export
  const exportData = expenses.map(exp => ({
    "Expense Number": exp.expenseNumber,
    "Date": exp.expenseDate.toLocaleDateString('en-IN'),
    "Vendor": exp.vendor?.name || 'Unknown',
    "Category": exp.category?.name || 'Unknown',
    "Taxable Amount": Number(exp.taxableAmount),
    "Input CGST": Number(exp.inputCGST),
    "Input SGST": Number(exp.inputSGST),
    "Input IGST": Number(exp.inputIGST),
    "Total Input GST": Number(exp.totalInputGST),
    "TDS Amount": Number(exp.tdsAmount),
    "Net Amount": Number(exp.netAmount),
    "Payment Status": exp.paymentStatus.replace('_', ' ')
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-theme-text">Expense Report</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Expense_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">EXPENSE REPORT</h1>
        <p className="text-center text-theme-text-muted">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-red-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Expenses</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-indigo-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Input GST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalInputGST)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total TDS</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalTDS)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Paid Expenses</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.paidExpenses)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-orange-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Unpaid Expenses</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.unpaidExpenses)}</p>
        </div>
      </div>

      <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              name="q"
              defaultValue={searchFilter || ""}
              placeholder="Search expense no. or description..."
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
              <Link href="/reports/expenses" className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-theme-text border border-theme-border flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-surface-hover print:bg-theme-surface print:border-b-2 print:border-theme-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Expense</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Input GST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">TDS</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-theme-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-theme-text-muted">No expenses found for the selected criteria.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-theme-surface-hover">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-theme-primary">
                      <Link href={`/expenses/${exp.id}`}>{exp.expenseNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">{exp.expenseDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-theme-text max-w-[150px] truncate">
                      {exp.vendor?.name || 'Unknown'}
                      <div className="text-xs text-theme-text-muted">{exp.category?.name || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.taxableAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.totalInputGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-purple-600">{formatCurrency(Number(exp.tdsAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-theme-text">{formatCurrency(Number(exp.netAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        exp.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                        exp.paymentStatus === 'PARTIALLY_PAID' ? 'bg-theme-surface-hover text-blue-800' : 'bg-yellow-100 text-yellow-800'
                      } print:border print:border-gray-400 print:bg-transparent`}>
                        {exp.paymentStatus.replace('_', ' ')}
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
