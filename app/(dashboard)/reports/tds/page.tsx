import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function TdsReportPage({
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

  const { data: expenses, summary } = await ReportsService.getTdsReport(filters);

  // Flatten data for export
  const exportData = expenses.map(exp => ({
    "Expense Number": exp.expenseNumber,
    "Date": exp.expenseDate.toLocaleDateString('en-IN'),
    "Vendor": exp.vendor?.name || 'Unknown',
    "Vendor PAN": exp.vendor?.pan || '',
    "TDS Rate": `${exp.tdsRate || 0}%`,
    "Gross Amount": Number(exp.grossAmount),
    "TDS Amount": Number(exp.tdsAmount),
    "Net Amount": Number(exp.netAmount)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">TDS Report</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="TDS_Report" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">TDS REPORT</h1>
        <p className="text-center text-gray-600">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Gross Amount</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalGrossAmount)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total TDS Deducted</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalTDSDeducted)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">TDS Transactions</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{summary.numberOfTransactions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="To Date" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
            {(fromFilter || toFilter) && (
              <Link href="/reports/tds" className="bg-white text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-700 border border-gray-300 flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 print:bg-white print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor / PAN</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TDS Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No TDS deductions found for the selected criteria.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/expenses/${exp.id}`}>{exp.expenseNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{exp.expenseDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                      {exp.vendor?.name || 'Unknown'}
                      <div className="text-xs text-gray-500 font-mono">{exp.vendor?.pan || 'No PAN'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{Number(exp.tdsRate) || 0}%</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(exp.grossAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-purple-600">{formatCurrency(Number(exp.tdsAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(Number(exp.netAmount))}</td>
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
