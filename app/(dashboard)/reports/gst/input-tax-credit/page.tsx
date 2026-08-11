import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function InputTaxCreditPage({
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

  const { data: expenses, summary } = await ReportsService.getInputTaxCredit(filters);

  // Flatten data for export
  const exportData = expenses.map(exp => ({
    "Expense Number": exp.expenseNumber,
    "Date": exp.expenseDate.toLocaleDateString('en-IN'),
    "Vendor": exp.vendor?.name || 'Unknown',
    "Vendor GSTIN": exp.vendor?.gstin || '',
    "State": exp.vendor?.state || '',
    "Taxable Amount": Number(exp.taxableAmount),
    "Input CGST": Number(exp.inputCGST),
    "Input SGST": Number(exp.inputSGST),
    "Input IGST": Number(exp.inputIGST),
    "Total Input GST": Number(exp.totalInputGST)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-theme-text">Input GST / ITC Analysis</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="Input_Tax_Credit" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">INPUT GST / ITC ANALYSIS</h1>
        <p className="text-center text-theme-text-muted">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-theme-primary print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Taxable Purchases</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalTaxablePurchases)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-indigo-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Input CGST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalInputCGST)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Input SGST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalInputSGST)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-pink-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Input IGST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalInputIGST)}</p>
        </div>
        <div className="bg-theme-surface rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-theme-border">
          <h3 className="text-xs font-medium text-theme-text-muted uppercase">Total Input GST</h3>
          <p className="mt-1 text-xl font-bold text-theme-text">{formatCurrency(summary.totalInputGST)}</p>
        </div>
      </div>

      <div className="bg-theme-surface-hover border-l-4 border-blue-400 p-4 mb-8 no-print">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-theme-primary-dark">
              This report provides an analysis of Input GST from approved expenses. It is an operational report and does not constitute a direct government filing.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-theme-surface rounded-lg shadow border border-theme-border overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-theme-border bg-theme-surface-hover no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary" title="To Date" />
            <button type="submit" className="bg-theme-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-primary-dark">Filter</button>
            {(fromFilter || toFilter) && (
              <Link href="/reports/gst/input-tax-credit" className="bg-theme-surface text-theme-text-muted px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-200 border border-theme-border flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-surface-hover print:bg-theme-surface print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Expense Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Vendor / GSTIN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Input CGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Input SGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Input IGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">Total Input GST</th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface divide-y divide-theme-border">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-theme-text-muted">No ITC data found for the selected criteria.</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-theme-surface-hover">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-theme-primary">
                      <Link href={`/expenses/${exp.id}`}>{exp.expenseNumber}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">{exp.expenseDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-theme-text max-w-[200px] truncate">
                      {exp.vendor?.name || 'Unknown'}
                      <div className="text-xs text-theme-text-muted font-mono">{exp.vendor?.gstin || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-theme-text-muted">{exp.vendor?.state || ''}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.taxableAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.inputCGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.inputSGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-theme-text-muted">{formatCurrency(Number(exp.inputIGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-theme-text">{formatCurrency(Number(exp.totalInputGST))}</td>
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
