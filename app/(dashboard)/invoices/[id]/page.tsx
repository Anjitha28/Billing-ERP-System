import { TaxInvoiceService } from "@/services/tax-invoice.service";
import { notFound } from "next/navigation";
import { TaxInvoiceStatus } from "@prisma/client";
import { TaxEngine } from "@/lib/tax";
import { BUSINESS_LOCATION } from "@/lib/config/business";
import { numberToWords } from "@/lib/utils/number-to-words";
import { CancelInvoiceButton } from "./CancelInvoiceButton";
import { PrintButton } from "./PrintButton";

export default async function TaxInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const invoice = await TaxInvoiceService.getTaxInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const getStatusColor = (status: TaxInvoiceStatus) => {
    switch (status) {
      case "CONFIRMED": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PAID": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PARTIALLY_PAID": return "bg-orange-100 text-orange-800 border-orange-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isIntraState = !invoice.stateSnapshot || (invoice.stateSnapshot.toLowerCase().trim() === BUSINESS_LOCATION.state.toLowerCase().trim());

  // Regenerate GST Summary Grouping dynamically from the snapshot items
  const gstSummaryGroups = TaxEngine.getGSTSummary(invoice.items.map(i => ({
    gstRate: Number(i.gstRate),
    taxableAmount: Number(i.taxableAmount),
    cgstAmount: Number(i.cgstAmount),
    sgstAmount: Number(i.sgstAmount),
    igstAmount: Number(i.igstAmount),
    totalGST: Number(i.totalGST),
  })));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Actions (Hidden in Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500 text-sm">Confirmed on {new Date(invoice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {invoice.status !== "CANCELLED" && (
            <CancelInvoiceButton invoiceId={invoice.id} />
          )}
          <PrintButton />
        </div>
      </div>

      {invoice.status === "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl print:border-none print:bg-white print:text-black">
          <p className="font-bold">This invoice was cancelled.</p>
          {invoice.cancellationReason && <p className="text-sm mt-1">Reason: {invoice.cancellationReason}</p>}
        </div>
      )}

      {/* Printable Invoice Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Invoice Header */}
        <div className="p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">TAX INVOICE</h2>
            
            <div className="mt-8 space-y-1 text-sm text-gray-600">
              <p className="font-bold text-gray-900 text-lg">Your Company Name</p>
              <p>123 Business Avenue, Tech Park</p>
              <p>{BUSINESS_LOCATION.state} - {BUSINESS_LOCATION.stateCode}</p>
              <p>GSTIN: 27AAAAA0000A1Z5</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end text-right">
            <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide mb-6 ${getStatusColor(invoice.status)} print:border-2 print:border-black print:text-black print:bg-white`}>
              {invoice.status}
            </div>
            
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="text-gray-500 pr-6 py-1">Invoice Number:</td>
                  <td className="font-bold text-gray-900">{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="text-gray-500 pr-6 py-1">Invoice Date:</td>
                  <td className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Info (Snapshots) */}
        <div className="p-8 border-b border-gray-200 bg-gray-50/50 print:bg-white">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 print:text-black">Billed To</h3>
          <div className="text-sm text-gray-800 space-y-1">
            <p className="font-bold text-gray-900 text-base">{invoice.customerNameSnapshot}</p>
            {invoice.businessNameSnapshot && <p>{invoice.businessNameSnapshot}</p>}
            {invoice.addressSnapshot && <p>{invoice.addressSnapshot}</p>}
            {invoice.stateSnapshot && <p>{invoice.stateSnapshot}</p>}
            {invoice.stateCodeSnapshot && <p className="pt-2 font-medium">State Code: {invoice.stateCodeSnapshot}</p>}
            {invoice.gstinSnapshot && <p className="pt-1 font-medium">GSTIN: {invoice.gstinSnapshot}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 text-sm font-bold text-gray-900">
                <th className="py-3 pl-2 w-12">#</th>
                <th className="py-3">Item Description</th>
                <th className="py-3 text-right">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Disc</th>
                <th className="py-3 text-right">Tax</th>
                <th className="py-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-4 pl-2 text-gray-500">{index + 1}</td>
                  <td className="py-4">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.description && <p className="text-gray-500 text-xs mt-1">{item.description}</p>}
                    <p className="text-gray-400 text-xs mt-1">HSN/SAC: {item.hsnSacCode}</p>
                  </td>
                  <td className="py-4 text-right">{item.quantity.toString()} {item.unit}</td>
                  <td className="py-4 text-right">₹{item.unitPrice.toString()}</td>
                  <td className="py-4 text-right">{Number(item.discountPercent) > 0 ? `${item.discountPercent.toString()}%` : '-'}</td>
                  <td className="py-4 text-right">{item.gstRate.toString()}%</td>
                  <td className="py-4 text-right pr-2 font-medium text-gray-900">₹{item.totalAmount.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Summary Grouping */}
        {gstSummaryGroups.length > 0 && (
          <div className="p-8 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 print:text-black">GST Summary</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-medium print:text-black">
                  <th className="pb-2">GST Rate</th>
                  <th className="pb-2 text-right">Taxable Amt</th>
                  {isIntraState ? (
                    <>
                      <th className="pb-2 text-right">CGST</th>
                      <th className="pb-2 text-right">SGST</th>
                    </>
                  ) : (
                    <th className="pb-2 text-right">IGST</th>
                  )}
                  <th className="pb-2 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {gstSummaryGroups.map((group) => (
                  <tr key={group.gstRate} className="border-b border-gray-100 last:border-0">
                    <td className="py-2">{group.gstRate}%</td>
                    <td className="py-2 text-right">₹{group.taxableAmount.toFixed(2)}</td>
                    {isIntraState ? (
                      <>
                        <td className="py-2 text-right">₹{group.cgstAmount.toFixed(2)}</td>
                        <td className="py-2 text-right">₹{group.sgstAmount.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="py-2 text-right">₹{group.igstAmount.toFixed(2)}</td>
                    )}
                    <td className="py-2 text-right font-medium">₹{group.totalTax.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Amount In Words & Totals */}
        <div className="p-8 border-t border-gray-200 flex flex-col lg:flex-row justify-between items-start gap-8 bg-gray-50/50 print:bg-white">
          <div className="flex-1 w-full text-sm">
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Total Amount (in words)</h4>
              <p className="font-medium text-gray-700 italic">
                {numberToWords(Number(invoice.netAmount))}
              </p>
            </div>
            {invoice.notes && (
              <div className="text-gray-600">
                <h4 className="font-bold text-gray-900 mb-2">Terms & Conditions</h4>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-80 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 px-2">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toString()}</span>
            </div>
            {Number(invoice.totalDiscount) > 0 && (
              <div className="flex justify-between text-red-600 px-2">
                <span>Discount</span>
                <span>-₹{invoice.totalDiscount.toString()}</span>
              </div>
            )}
            
            {/* Tax Breakdown */}
            <div className="py-3 border-y border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600 px-2 font-medium">
                <span>Taxable Amount</span>
                <span>₹{invoice.taxableAmount.toString()}</span>
              </div>
              
              {isIntraState ? (
                <>
                  <div className="flex justify-between text-gray-600 px-2 text-xs">
                    <span>CGST</span>
                    <span>₹{invoice.totalCGST.toString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 px-2 text-xs">
                    <span>SGST</span>
                    <span>₹{invoice.totalSGST.toString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-600 px-2 text-xs">
                  <span>IGST</span>
                  <span>₹{invoice.totalIGST.toString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-medium text-gray-800 px-2 pt-2">
              <span>Gross Amount</span>
              <span>₹{invoice.grossAmount.toString()}</span>
            </div>

            {Number(invoice.tdsAmount) > 0 && (
              <div className="flex justify-between text-red-600 font-medium pt-2 border-t border-gray-200 px-2">
                <span>Less: TDS ({invoice.tdsRate?.toString()}%)</span>
                <span>-₹{invoice.tdsAmount.toString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-bold text-gray-900 px-2 pt-3 border-t border-gray-200">
              <span>Net Amount Payable</span>
              <span className="text-blue-600 print:text-black">₹{invoice.netAmount.toString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 flex justify-between items-end">
          <div className="text-xs text-gray-400">
            This is a computer generated invoice.
          </div>
          <div className="text-center w-48">
            <div className="border-b border-gray-400 h-12 mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
