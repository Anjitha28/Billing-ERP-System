import { requireAdmin } from '@/lib/auth-utils';
import { DashboardService } from '@/services/dashboard.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { RevenueVsExpenseChart, OperatingResultChart, ExpenseCategoryChart } from './DashboardCharts';

export default async function DashboardPage({
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
    paymentSummary,
    monthlySummary,
    topExpenses,
    insights
  ] = await Promise.all([
    DashboardService.getDashboardKPIs(filters),
    DashboardService.getRevenueVsExpenseTrend(filters),
    DashboardService.getExpenseByCategory(filters),
    DashboardService.getRevenueByCustomer(filters),
    DashboardService.getPaymentStatusSummary(filters),
    DashboardService.getMonthlyFinancialSummary(filters),
    DashboardService.getTopExpenses(filters),
    DashboardService.getFinancialInsights(filters)
  ]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Profit & Loss Dashboard</h1>
        
        {/* Date Filter */}
        <form className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <input
            type="date"
            name="from"
            defaultValue={fromFilter || ""}
            className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            title="From Date"
          />
          <input
            type="date"
            name="to"
            defaultValue={toFilter || ""}
            className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            title="To Date"
          />
          <button
            type="submit"
            className="bg-theme-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-primary-dark"
          >
            Apply
          </button>
          {(fromFilter || toFilter) && (
            <Link
              href="/dashboard"
              className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-200 border border-theme-border flex items-center justify-center"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Financial Insights */}
      {insights.length > 0 && (
        <div className="bg-theme-surface-hover border-l-4 border-theme-primary p-4 mb-8 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Financial Insights</h3>
              <div className="mt-2 text-sm text-theme-primary-dark">
                <ul className="list-disc pl-5 space-y-1">
                  {insights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Total Revenue</h3>
          <p className="mt-2 text-2xl font-bold text-theme-text">{formatCurrency(kpis.totalRevenue)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Total Expenses</h3>
          <p className="mt-2 text-2xl font-bold text-theme-text">{formatCurrency(kpis.totalExpenses)}</p>
        </div>
        <div className={`bg-theme-surface rounded-lg shadow p-6 border-l-4 ${kpis.operatingResult >= 0 ? 'border-theme-primary' : 'border-red-500'}`}>
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Operating Result</h3>
          <p className={`mt-2 text-2xl font-bold ${kpis.operatingResult >= 0 ? 'text-theme-primary' : 'text-red-600'}`}>
            {formatCurrency(kpis.operatingResult)}
          </p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Profit Margin</h3>
          <p className="mt-2 text-2xl font-bold text-theme-text">{kpis.profitMargin.toFixed(2)}%</p>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-orange-400">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Outstanding Receivables</h3>
          <p className="mt-2 text-2xl font-bold text-theme-text">{formatCurrency(kpis.outstandingReceivables)}</p>
          <p className="text-sm text-theme-text-muted mt-1">From Unpaid/Partially Paid Revenue</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-pink-400">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Outstanding Payables</h3>
          <p className="mt-2 text-2xl font-bold text-theme-text">{formatCurrency(kpis.outstandingPayables)}</p>
          <p className="text-sm text-theme-text-muted mt-1">From Unpaid/Partially Paid Expenses</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-theme-surface p-6 rounded-lg shadow border border-theme-border">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <RevenueVsExpenseChart data={trends} />
        </div>
        <div className="bg-theme-surface p-6 rounded-lg shadow border border-theme-border">
          <h3 className="text-lg font-semibold mb-4">Operating Result Trend</h3>
          <OperatingResultChart data={trends} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-theme-surface p-6 rounded-lg shadow border border-theme-border">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <ExpenseCategoryChart data={expenseCategories} />
        </div>
        <div className="bg-theme-surface p-6 rounded-lg shadow border border-theme-border">
          <h3 className="text-lg font-semibold mb-4">Top Customers by Revenue</h3>
          {topCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-theme-text-muted">No revenue data available.</div>
          ) : (
            <div className="overflow-hidden mt-4">
              <ul className="divide-y divide-theme-border">
                {topCustomers.map((customer, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center">
                    <span className="font-medium text-theme-text truncate pr-4">{customer.customer}</span>
                    <div className="text-right flex-shrink-0">
                      <span className="block text-sm font-bold text-theme-text">{formatCurrency(customer.amount)}</span>
                      <span className="block text-xs text-theme-text-muted">{customer.percentage.toFixed(1)}% of total</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden">
          <div className="p-4 border-b border-theme-border bg-theme-surface-hover">
            <h3 className="text-lg font-semibold text-theme-text">Monthly Financial Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border">
              <thead className="bg-theme-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Expenses</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Margin</th>
                </tr>
              </thead>
              <tbody className="bg-theme-surface divide-y divide-theme-border">
                {monthlySummary.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-theme-text-muted">No monthly data available.</td>
                  </tr>
                ) : (
                  monthlySummary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-theme-surface-hover">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text">{row.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{formatCurrency(row.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">{formatCurrency(row.expenses)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${row.operatingResult >= 0 ? 'text-theme-primary' : 'text-red-600'}`}>
                        {formatCurrency(row.operatingResult)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-theme-text">{row.profitMargin.toFixed(2)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden">
          <div className="p-4 border-b border-theme-border bg-theme-surface-hover">
            <h3 className="text-lg font-semibold text-theme-text">Top Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border">
              <thead className="bg-theme-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Vendor & Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-theme-surface divide-y divide-theme-border">
                {topExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-theme-text-muted">No expenses found.</td>
                  </tr>
                ) : (
                  topExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-theme-surface-hover">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-theme-primary">
                          <Link href={`/expenses/${expense.id}`}>{expense.expenseNumber}</Link>
                        </div>
                        <div className="text-xs text-theme-text-muted">{expense.expenseDate.toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-theme-text truncate max-w-[200px]">{expense.vendor?.name || 'No Vendor'}</div>
                        <div className="text-xs text-theme-text-muted">{expense.category?.name || 'Multiple Categories'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-theme-text">
                        {formatCurrency(Number(expense.netAmount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
