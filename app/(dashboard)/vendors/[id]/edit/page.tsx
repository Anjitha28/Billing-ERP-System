import { VendorService } from "@/services/vendor.service";
import { notFound } from "next/navigation";
import { VendorForm } from "../../VendorForm";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const vendor = await VendorService.getVendorById(id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
        <p className="text-gray-500 text-sm mt-1">Update information for {vendor.name}.</p>
      </div>

      <VendorForm initialData={vendor} />
    </div>
  );
}
