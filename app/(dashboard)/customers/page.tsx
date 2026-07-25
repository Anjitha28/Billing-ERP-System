import { CustomerService } from "@/services/customer.service";
import Link from "next/link";
import { CustomerClientList } from "./CustomerClientList";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: "B2B" | "B2C" | "ALL"; status?: "ACTIVE" | "INACTIVE" | "ALL" };
}) {
  const query = searchParams.q || "";
  const typeFilter = searchParams.type === "B2B" || searchParams.type === "B2C" ? searchParams.type : undefined;
  
  let isActiveFilter = undefined;
  if (searchParams.status === "ACTIVE" || !searchParams.status) {
    isActiveFilter = true;
  } else if (searchParams.status === "INACTIVE") {
    isActiveFilter = false;
  }

  const customers = await CustomerService.getCustomers({
    search: query,
    customerType: typeFilter,
    isActive: isActiveFilter,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your B2B and B2C clients.</p>
        </div>
        <Link 
          href="/customers/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Customer
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CustomerClientList initialCustomers={customers} searchParams={searchParams} />
      </div>
    </div>
  );
}
