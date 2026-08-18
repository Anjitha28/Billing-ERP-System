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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Customers</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Manage your B2B and B2C clients.</p>
        </div>
        <Link 
          href="/customers/new" 
          className="inline-flex items-center justify-center px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-medium rounded-lg transition-colors shadow-sm gap-2"
        >
          + New Customer
        </Link>
      </div>

      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm">
        <CustomerClientList initialCustomers={customers} searchParams={searchParams} />
      </div>
    </div>
  );
}
