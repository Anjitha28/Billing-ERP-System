import { requireAdmin } from '@/lib/auth-utils';
import { DashboardService } from '@/services/dashboard.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { RevenueVsExpenseChart, OperatingResultChart, ExpenseCategoryChart } from '../dashboard/DashboardCharts';
import { PrintButton } from '@/components/PrintButton';

export default async function ProfitLossPage({
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

  const [
    kpis,
    trends,
    expenseCategories,
    topCustomers,
    monthlySummary
  ] = await Promise.all([
    DashboardService.getDashboardKPIs(filters),
    DashboardService.getRevenueVsExpenseTrend(filters),
    DashboardService.getExpenseByCategory(filters),
    DashboardService.getRevenueByCustomer(filters),
    DashboardService.getMonthlyFinancialSummary(filters),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">Profit & Loss</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
          <form className="flex flex-wrap gap-3">
            <input
              type="date"
              name="from"
              defaultValue={fromFilter || ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="From Date"
            />
            <input
              type="date"
              name="to"
              defaultValue={toFilter || ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="To Date"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Apply
            </button>
            {(fromFilter || toFilter) && (
              <Link
                href="/profit-loss"
                className="bg-white text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-700 border border-gray-300 flex items-center justify-center"
              >
                Clear
              </Link>
            )}
          </form>
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">PROFIT & LOSS STATEMENT</h1>
        <p className="text-center text-gray-600">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Expenses</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalExpenses)}</p>
        </div>
        <div className={`bg-white rounded-lg shadow p-6 border-t-4 ${kpis.operatingResult >= 0 ? 'border-blue-500' : 'border-red-500'} print:shadow-none print:border print:border-gray-300`}>
          <h3 className="text-sm font-medium text-gray-500 uppercase">Operating Result</h3>
          <p className={`mt-2 text-2xl font-bold ${kpis.operatingResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(kpis.operatingResult)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Profit Margin</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{kpis.profitMargin.toFixed(2)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <RevenueVsExpenseChart data={trends} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Operating Result Trend</h3>
          <OperatingResultChart data={trends} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden mb-8 print:shadow-none print:border-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 print:bg-white print:border-b-2 print:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 uppercase">Formal Profit & Loss Statement</h3>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">REVENUE</h4>
            <div className="flex justify-between items-center py-2 px-4">
              <span className="text-gray-700">Sales Revenue</span>
              <span className="font-medium">{formatCurrency(kpis.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 font-bold mt-2 border-t">
              <span className="text-gray-900">TOTAL REVENUE</span>
              <span className="text-gray-900">{formatCurrency(kpis.totalRevenue)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-800 text-lg border-b pb-2 mb-4">OPERATING EXPENSES</h4>
            <div className="space-y-1">
              {expenseCategories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-4">
                  <span className="text-gray-700">{cat.category}</span>
                  <span className="font-medium">{formatCurrency(cat.amount)}</span>
                </div>
              ))}
              {expenseCategories.length === 0 && (
                <div className="py-2 px-4 text-gray-500 italic">No expenses recorded.</div>
              )}
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 font-bold mt-2 border-t">
              <span className="text-gray-900">TOTAL OPERATING EXPENSES</span>
              <span className="text-gray-900">{formatCurrency(kpis.totalExpenses)}</span>
            </div>
          </div>

          <div className="mb-4 pt-4 border-t-4 border-double border-gray-300">
            <div className="flex justify-between items-center py-3 px-4 bg-blue-50 font-bold text-lg">
              <span className="text-blue-900">OPERATING RESULT</span>
              <span className={kpis.operatingResult >= 0 ? "text-blue-700" : "text-red-600"}>
                {formatCurrency(kpis.operatingResult)}
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center py-2 px-4 font-bold text-gray-700">
              <span>PROFIT MARGIN</span>
              <span>{kpis.profitMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <ExpenseCategoryChart data={expenseCategories} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Revenue by Customer</h3>
          {topCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">No revenue data available.</div>
          ) : (
            <div className="overflow-hidden mt-4">
              <ul className="divide-y divide-gray-200">
                {topCustomers.map((customer, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center">
                    <span className="font-medium text-gray-900 truncate pr-4">{customer.customer}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-sm font-bold text-gray-900">{formatCurrency(customer.amount)}</span>
                      <span className="block text-xs text-gray-500">{customer.percentage.toFixed(1)}% of total</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden no-print">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Statement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Operating Result</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlySummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No monthly data available.</td>
                </tr>
              ) : (
                monthlySummary.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">{formatCurrency(row.expenses)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${row.operatingResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(row.operatingResult)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{row.profitMargin.toFixed(2)}%</td>
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
