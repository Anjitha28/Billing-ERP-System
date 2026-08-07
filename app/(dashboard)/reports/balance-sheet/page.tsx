import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-utils';
import Link from 'next/link';


export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  
  const asOfFilter = typeof params.asOf === "string" ? params.asOf : "";
  const asOfDate = asOfFilter ? new Date(asOfFilter) : new Date();
  asOfDate.setHours(23, 59, 59, 999);

  // Cash: Paid Revenue - Paid Expenses via FinancialTransactions
  const cashTransactions = await prisma.financialTransaction.findMany({
    where: {
      paymentStatus: 'PAID',
      transactionDate: { lte: asOfDate }
    }
  });

  const cashIn = cashTransactions.filter(t => t.type === 'REVENUE').reduce((sum, t) => sum + Number(t.amount), 0);
  const cashOut = cashTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
  const cashEquivalents = cashIn - cashOut;

  // AR: Unpaid/Partially Paid Tax Invoices
  const taxInvoices = await prisma.taxInvoice.findMany({
    where: {
      status: { not: 'CANCELLED' },
      invoiceDate: { lte: asOfDate }
    }
  });
  
  // Need to figure out the paid portion of tax invoices up to this date
  // Since we only track `FinancialTransaction` status and we don't have partial payments fully modeled yet, 
  // we'll assume any `TaxInvoice` mapped to a `PAID` FinancialTransaction is fully paid.
  const paidInvoiceIds = new Set(
    cashTransactions.filter(t => t.type === 'REVENUE' && t.sourceType === 'TAX_INVOICE').map(t => t.sourceId)
  );
  
  const accountsReceivable = taxInvoices
    .filter(inv => !paidInvoiceIds.has(inv.id))
    .reduce((sum, inv) => sum + Number(inv.netAmount), 0);

  // AP: Unpaid Expenses
  const expenses = await prisma.expense.findMany({
    where: {
      status: { not: 'CANCELLED' },
      expenseDate: { lte: asOfDate }
    }
  });

  const paidExpenseIds = new Set(
    cashTransactions.filter(t => t.type === 'EXPENSE' && t.sourceType === 'EXPENSE').map(t => t.sourceId)
  );

  const accountsPayable = expenses
    .filter(exp => !paidExpenseIds.has(exp.id))
    .reduce((sum, exp) => sum + Number(exp.netAmount), 0);

  const totalAssets = cashEquivalents + accountsReceivable;
  const totalLiabilities = accountsPayable;
  
  // Equity = Assets - Liabilities (matches Retained Earnings)
  const retainedEarnings = totalAssets - totalLiabilities;
  const totalEquity = retainedEarnings;
  
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-500 text-sm mt-1">Snapshot of the business financial position.</p>
        </div>
        <Link 
          href="/reports" 
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Reports
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-end gap-4">
        <form className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-700 mb-1">As Of Date</label>
          <div className="flex gap-2">
            <input type="date" name="asOf" defaultValue={asOfFilter} className="w-full border-gray-300 rounded-md text-sm" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Apply
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between">
          <h2 className="text-lg font-bold text-gray-900">As of {asOfDate.toLocaleDateString()}</h2>
          <span className="text-sm font-medium text-gray-500">Amounts in INR (₹)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          
          {/* Assets */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Assets</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Assets</h4>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Cash & Bank Equivalents</span>
                  <span className="font-medium">₹{cashEquivalents.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Accounts Receivable (AR)</span>
                  <span className="font-medium">₹{accountsReceivable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Assets</span>
              <span className="font-bold text-gray-900">₹{totalAssets.toFixed(2)}</span>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Liabilities & Equity</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Liabilities</h4>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Accounts Payable (AP)</span>
                  <span className="font-medium">₹{accountsPayable.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Equity</h4>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">Retained Earnings</span>
                  <span className="font-medium">₹{retainedEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Liabilities & Equity</span>
              <span className="font-bold text-gray-900">₹{totalLiabilitiesAndEquity.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
