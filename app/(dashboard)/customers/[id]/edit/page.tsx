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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-text">Edit Customer</h1>
        <p className="text-theme-text-muted text-sm mt-1">Update information for {customer.legalName}.</p>
      </div>
      
      <CustomerForm initialData={customer} />
    </div>
  );
}
