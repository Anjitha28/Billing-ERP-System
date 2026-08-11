import { FinancialTransactionService } from '@/services/financial-transaction.service';
import { PaymentStatus, FinancialTransactionType } from '@prisma/client';
import Link from 'next/link';
import { RevenueActions } from './RevenueActions';

export async function UnifiedLedger({
  searchParams,
}: {
  searchParams: { q?: string; status?: PaymentStatus; type?: FinancialTransactionType; from?: string; to?: string };
}) {

  const query = await Promise.resolve(searchParams.q || "");
  const statusFilter = await Promise.resolve(searchParams.status);
  const typeFilter = await Promise.resolve(searchParams.type);
  const fromFilter = await Promise.resolve(searchParams.from);
  const toFilter = await Promise.resolve(searchParams.to);

  const transactions = await FinancialTransactionService.getTransactions({
    search: query,
    type: typeFilter,
    paymentStatus: statusFilter,
    fromDate: fromFilter,
    toDate: toFilter,
  });

  const summary = await FinancialTransactionService.getLedgerSummary();

  return (
    <div className="space-y-6 mt-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-theme-text">₹{summary.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Total Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-theme-text">₹{summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`bg-theme-surface rounded-lg shadow p-6 border-l-4 ${summary.netOperatingResult >= 0 ? 'border-theme-primary' : 'border-red-500'}`}>
          <h3 className="text-sm font-medium text-theme-text-muted uppercase">Net Operating Result</h3>
          <p className={`mt-2 text-3xl font-bold ${summary.netOperatingResult >= 0 ? 'text-theme-primary' : 'text-red-600'}`}>
            ₹{summary.netOperatingResult.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-theme-surface rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-theme-border">
          <form className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by transaction no. or description..."
              className="flex-1 border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary min-w-[200px]"
            />
            <select
              name="type"
              defaultValue={typeFilter || ""}
              className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
            >
              <option value="">All Types</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </select>
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
            <input
              type="date"
              name="from"
              defaultValue={fromFilter || ""}
              className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            <input
              type="date"
              name="to"
              defaultValue={toFilter || ""}
              className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
            <button
              type="submit"
              className="bg-theme-surface-hover text-theme-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-surface-hover"
            >
              Filter
            </button>
            {(query || statusFilter || typeFilter || fromFilter || toFilter) && (
              <Link
                href="/ledger"
                className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-theme-text border border-theme-border flex items-center justify-center"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-surface-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-theme-text-muted">
                    No transactions found for the selected period.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-theme-surface-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-theme-text">{txn.transactionNumber}</div>
                      <div className="text-sm text-theme-text-muted">{txn.transactionDate.toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${txn.type === 'REVENUE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-theme-text max-w-xs truncate">{txn.description}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${txn.type === 'REVENUE' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'REVENUE' ? '+' : '-'}₹{Number(txn.netAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${txn.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                          txn.paymentStatus === 'PARTIALLY_PAID' ? 'bg-theme-surface-hover text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {txn.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link 
                          href={txn.sourceType === "TAX_INVOICE" ? `/invoices/${txn.sourceId}` : txn.sourceType === "EXPENSE" ? `/expenses/${txn.sourceId}` : "#"} 
                          className="text-theme-primary hover:text-blue-900"
                        >
                          Source
                        </Link>
                        <RevenueActions txnId={txn.id} currentStatus={txn.paymentStatus} />
                      </div>
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
