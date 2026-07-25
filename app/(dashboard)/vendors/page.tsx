import Link from "next/link";
import { VendorService } from "@/services/vendor.service";

export const dynamic = "force-dynamic";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: "ACTIVE" | "INACTIVE" };
}) {
  const query = searchParams.q || "";
  const isActiveFilter = searchParams.status === "ACTIVE" ? true : searchParams.status === "INACTIVE" ? false : undefined;

  const vendors = await VendorService.getVendors({ search: query, isActive: isActiveFilter });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your suppliers and service providers.</p>
        </div>
        <Link 
          href="/vendors/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Vendor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form className="flex-1 w-full max-w-md flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search vendors..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
              Search
            </button>
          </form>

          <div className="flex gap-2 text-sm">
            <Link href={`/vendors?q=${query}`} className={`px-3 py-1.5 rounded-lg border ${!searchParams.status ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              All
            </Link>
            <Link href={`/vendors?status=ACTIVE&q=${query}`} className={`px-3 py-1.5 rounded-lg border ${searchParams.status === 'ACTIVE' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Active
            </Link>
            <Link href={`/vendors?status=INACTIVE&q=${query}`} className={`px-3 py-1.5 rounded-lg border ${searchParams.status === 'INACTIVE' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              Inactive
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">GSTIN</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Expenses</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No vendors found. Add your first supplier to get started.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id} className={`hover:bg-gray-50/50 transition-colors ${!vendor.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vendor.name}</div>
                      {vendor.businessName && (
                        <div className="text-xs text-gray-500">{vendor.businessName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{vendor.phone || '-'}</div>
                      <div className="text-xs text-gray-500">{vendor.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vendor.gstin || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vendor._count.expenses}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link href={`/vendors/${vendor.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </Link>
                      <Link href={`/vendors/${vendor.id}/edit`} className="text-gray-600 hover:text-gray-900">
                        Edit
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
