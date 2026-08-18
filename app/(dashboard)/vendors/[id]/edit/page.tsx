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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Edit Vendor</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Update information for {vendor.name}.</p>
        </div>
      </div>

      <VendorForm initialData={vendor} />
    </div>
  );
}
