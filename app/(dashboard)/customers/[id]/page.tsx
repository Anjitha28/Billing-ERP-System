import { CustomerService } from "@/services/customer.service";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const customer = await CustomerService.getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.legalName}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${customer.customerType === 'B2B' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
              {customer.customerType}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${customer.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {customer.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-gray-500">
              Added on {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Customer Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              {customer.tradeName && (
                <div>
                  <span className="block text-gray-500 mb-1">Trade Name</span>
                  <span className="text-gray-900 font-medium">{customer.tradeName}</span>
                </div>
              )}
              {customer.gstin && (
                <div>
                  <span className="block text-gray-500 mb-1">GSTIN</span>
                  <span className="text-gray-900 font-medium">{customer.gstin}</span>
                </div>
              )}
              {customer.pan && (
                <div>
                  <span className="block text-gray-500 mb-1">PAN</span>
                  <span className="text-gray-900 font-medium">{customer.pan}</span>
                </div>
              )}
              <div>
                <span className="block text-gray-500 mb-1">Email</span>
                <span className="text-gray-900 font-medium">{customer.email || "-"}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Phone</span>
                <span className="text-gray-900 font-medium">{customer.phone || "-"}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mt-8 mb-4">Billing Address</h3>
            <div className="text-sm text-gray-900 space-y-1">
              <p>{customer.address || "No address provided."}</p>
              {(customer.city || customer.pinCode) && (
                <p>{[customer.city, customer.pinCode].filter(Boolean).join(" - ")}</p>
              )}
              {(customer.state || customer.country) && (
                <p>
                  {[customer.state, customer.country].filter(Boolean).join(", ")}
                  {customer.stateCode && ` (Code: ${customer.stateCode})`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-gray-500 text-sm font-medium mb-2">Outstanding Balance</h4>
            <span className="text-3xl font-bold text-gray-900">₹0.00</span>
            <p className="text-xs text-gray-400 mt-2">Financial calculations will be available in Phase 8</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h4>
            <span className="text-3xl font-bold text-gray-900">₹0.00</span>
            <p className="text-xs text-gray-400 mt-2">Revenue ledger will be available in Phase 8</p>
          </div>
        </div>
      </div>

      {/* Placeholders for future history tables */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Recent Invoices</h3>
        <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
          Invoice generation will be implemented in Phase 6.
        </div>
      </div>
    </div>
  );
}
