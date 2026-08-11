import { ExpenseService } from "@/services/expense.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpenseActions } from "./ExpenseActions";
import { BUSINESS_LOCATION } from "@/lib/config/business";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const expense = await ExpenseService.getExpenseById(id);

  if (!expense) {
    notFound();
  }



  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{expense.expenseNumber}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
              ${expense.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                expense.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                expense.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500' : 
                'bg-red-100 text-red-800'}`}>
              {expense.status}
            </span>
            {expense.status !== "CANCELLED" && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${expense.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                  expense.paymentStatus === 'PARTIALLY_PAID' ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'}`}>
                {expense.paymentStatus}
              </span>
            )}
          </div>
          {expense.description && (
            <p className="text-gray-500 mt-1">{expense.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {expense.status === "DRAFT" && (
            <Link
              href={`/expenses/${expense.id}/edit`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Draft
            </Link>
          )}
          <ExpenseActions expenseId={expense.id} status={expense.status} paymentStatus={expense.paymentStatus} />
        </div>
      </div>

      {expense.status === "CANCELLED" && expense.cancellationReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          <strong>Cancellation Reason:</strong> {expense.cancellationReason}
          <div className="text-xs text-red-600 mt-1">Cancelled at: {expense.cancelledAt?.toLocaleString()}</div>
        </div>
      )}

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900">Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 bg-white">
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Vendor</th>
                    <th className="px-4 py-3 font-semibold text-right">Qty</th>
                    <th className="px-4 py-3 font-semibold text-right">Rate</th>
                    <th className="px-4 py-3 font-semibold text-right">GST %</th>
                    <th className="px-4 py-3 font-semibold text-right">TDS %</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expense.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-gray-900">{item.date ? new Date(item.date).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-4 text-gray-900 font-medium">
                        {item.description}
                        {item.hsnSacCode && <div className="text-xs text-gray-500 font-normal">HSN: {item.hsnSacCode}</div>}
                      </td>
                      <td className="px-4 py-4 text-gray-600">{item.category?.name || "-"}</td>
                      <td className="px-4 py-4 text-gray-600">{item.vendor?.name || "-"}</td>
                      <td className="px-4 py-4 text-right text-gray-600">{Number(item.quantity)} {item.unit}</td>
                      <td className="px-4 py-4 text-right text-gray-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-gray-600">{Number(item.gstRate)}%</td>
                      <td className="px-4 py-4 text-right text-gray-600">{item.tdsRate ? `${Number(item.tdsRate)}%` : "-"}</td>
                      <td className="px-4 py-4 text-right text-gray-900 font-medium">₹{Number(item.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Expense Date</span>
                <span className="font-medium text-gray-900">{new Date(expense.expenseDate).toLocaleDateString()}</span>
              </div>
              {expense.category && (
                <div className="flex justify-between text-gray-600">
                  <span>Category</span>
                  <span className="font-medium text-gray-900">{expense.category.name}</span>
                </div>
              )}
              {expense.vendor && (
                <div className="flex justify-between text-gray-600">
                  <span>Vendor</span>
                  <span className="font-medium text-blue-600">
                    <Link href={`/vendors/${expense.vendor.id}`}>{expense.vendor.name}</Link>
                  </span>
                </div>
              )}

              <div className="pt-4 mt-2 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Number(expense.subtotal).toFixed(2)}</span>
                </div>
                
                {Number(expense.totalInputGST) > 0 && (
                  <div className="pt-2 space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input Taxes</span>
                    {Number(expense.inputIGST) > 0 ? (
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>IGST</span>
                        <span>₹{Number(expense.inputIGST).toFixed(2)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-gray-600 text-xs">
                          <span>CGST</span>
                          <span>₹{Number(expense.inputCGST).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-xs">
                          <span>SGST</span>
                          <span>₹{Number(expense.inputSGST).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-gray-800 font-medium pt-2 border-t border-gray-100">
                  <span>Gross Amount</span>
                  <span>₹{Number(expense.grossAmount).toFixed(2)}</span>
                </div>

                {Number(expense.tdsAmount) > 0 && (
                  <div className="flex justify-between text-red-600 font-medium pt-1">
                    <span>Less TDS</span>
                    <span>-₹{Number(expense.tdsAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Net Payable</span>
                <span className="text-xl font-bold text-emerald-600">₹{Number(expense.netAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {expense.notes && (
            <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
              <h3 className="text-sm font-bold text-yellow-900 mb-2">Notes</h3>
              <p className="text-sm text-yellow-800 whitespace-pre-wrap">{expense.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
