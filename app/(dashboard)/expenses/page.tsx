import Link from "next/link";
import { ExpenseService } from "@/services/expense.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";
import { ExpenseStatus, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: { 
    q?: string; 
    status?: ExpenseStatus;
    paymentStatus?: PaymentStatus;
    categoryId?: string;
  };
}) {
  const [expenses, metrics, categories] = await Promise.all([
    ExpenseService.getExpenses(searchParams),
    ExpenseService.getDashboardMetrics(),
    ExpenseCategoryService.getExpenseCategories()
  ]);

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "APPROVED": return "bg-blue-100 text-blue-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-500 line-through";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "UNPAID": return "bg-red-50 text-red-700 border border-red-200";
      case "PARTIALLY_PAID": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "PAID": return "bg-green-50 text-green-700 border border-green-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track your business expenses.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/expense-categories" 
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Categories
          </Link>
          <Link 
            href="/expenses/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Record Expense
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Unpaid</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{metrics.unpaidCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{metrics.totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form className="flex-1 w-full max-w-2xl flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q}
              placeholder="Search by ID, vendor or description..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="categoryId"
              defaultValue={searchParams.categoryId || ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={searchParams.status || ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Filter
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-3">Expense Details</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Net Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No expenses found matching the criteria.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/expenses/${expense.id}`} className="font-medium text-blue-600 hover:underline block">
                        {expense.expenseNumber}
                      </Link>
                      <span className="text-xs text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                      <p className="text-sm text-gray-700 mt-1 truncate max-w-xs">{expense.description}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {expense.vendor?.name || <span className="text-gray-400 italic">No Vendor</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.category.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-gray-900">₹{expense.netAmount.toString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                        {expense.status !== "CANCELLED" && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getPaymentStatusColor(expense.paymentStatus)}`}>
                            {expense.paymentStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        href={`/expenses/${expense.id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View
                      </Link>
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
