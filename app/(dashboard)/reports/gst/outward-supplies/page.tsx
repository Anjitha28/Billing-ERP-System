import { requireAdmin } from '@/lib/auth-utils';
import { ReportsService } from '@/services/reports.service';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { ExportButton } from '@/components/ExportButton';

export default async function GstOutwardSuppliesPage({
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

  const { data: invoices, summary } = await ReportsService.getGstOutwardSupplies(filters);

  // Flatten data for export
  const exportData = invoices.map(inv => ({
    "Invoice Number": inv.invoiceNumber,
    "Date": inv.invoiceDate.toLocaleDateString('en-IN'),
    "Customer Name": inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown',
    "Customer GSTIN": inv.gstinSnapshot || inv.customer?.gstin || '',
    "State": inv.stateSnapshot || inv.customer?.state || '',
    "Taxable Amount": Number(inv.taxableAmount),
    "CGST": Number(inv.totalCGST),
    "SGST": Number(inv.totalSGST),
    "IGST": Number(inv.totalIGST),
    "Total GST": Number(inv.totalGST),
    "Invoice Value": Number(inv.netAmount)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-900">GST Outward Supplies</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 items-center">
          <ExportButton data={exportData} filename="GST_Outward_Supplies" />
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">GST OUTWARD SUPPLIES</h1>
        <p className="text-center text-gray-600">
          Period: {fromFilter ? new Date(fromFilter).toLocaleDateString() : 'Start'} to {toFilter ? new Date(toFilter).toLocaleDateString() : 'Present'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Taxable Value</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalTaxableValue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total CGST</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalCGST)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total SGST</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalSGST)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-pink-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total IGST</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalIGST)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <h3 className="text-xs font-medium text-gray-500 uppercase">Total Output GST</h3>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(summary.totalOutputGST)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden print:shadow-none print:border-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 no-print">
          <form className="flex flex-col md:flex-row gap-3">
            <input type="date" name="from" defaultValue={fromFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="From Date" />
            <input type="date" name="to" defaultValue={toFilter || ""} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="To Date" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
            {(fromFilter || toFilter) && (
              <Link href="/reports/gst/outward-supplies" className="bg-white text-gray-500 px-4 py-2 rounded-lg text-sm font-medium hover:text-gray-700 border border-gray-300 flex items-center justify-center">Clear</Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 print:bg-white print:border-b-2 print:border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / GSTIN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total GST</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">No GST outward supplies found for the selected criteria.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                      <div className="text-xs text-gray-500">{inv.invoiceDate.toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                      {inv.customerNameSnapshot || inv.customer?.legalName || 'Unknown'}
                      <div className="text-xs text-gray-500 font-mono">{inv.gstinSnapshot || inv.customer?.gstin || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{inv.stateSnapshot || inv.customer?.state || ''}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.taxableAmount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.totalCGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.totalSGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(Number(inv.totalIGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-700">{formatCurrency(Number(inv.totalGST))}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">{formatCurrency(Number(inv.netAmount))}</td>
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
