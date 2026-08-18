import { CustomerService } from "@/services/customer.service";
import { notFound } from "next/navigation";
import { CustomerForm } from "../../CustomerForm";

export default async function EditCustomerPage({
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Edit Customer</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Update information for {customer.legalName}.</p>
        </div>
      </div>
      
      <CustomerForm initialData={customer} />
    </div>
  );
}
