import { VendorService } from "@/services/vendor.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ToggleVendorStatusButton } from "../ToggleVendorStatusButton";

export default async function VendorDetailPage({
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-theme-surface p-6 rounded-xl shadow-sm border border-theme-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-theme-text">{vendor.name}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-theme-surface-hover text-theme-text'}`}>
              {vendor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {vendor.businessName && (
            <p className="text-theme-text-muted mt-1">{vendor.businessName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ToggleVendorStatusButton vendorId={vendor.id} isActive={vendor.isActive} />
          <Link
            href={`/vendors/${vendor.id}/edit`}
            className="px-4 py-2 bg-theme-bg text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Edit Vendor
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
          <div className="px-6 py-4 border-b border-theme-border bg-theme-surface-hover">
            <h3 className="text-sm font-bold text-theme-text">Contact Details</h3>
          </div>
          <div className="p-6 space-y-4 text-sm text-gray-200">
            <div>
              <span className="block text-theme-text-muted text-xs mb-1">Email</span>
              <span className="font-medium">{vendor.email || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-theme-text-muted text-xs mb-1">Phone</span>
              <span className="font-medium">{vendor.phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
          <div className="px-6 py-4 border-b border-theme-border bg-theme-surface-hover">
            <h3 className="text-sm font-bold text-theme-text">Tax Information</h3>
          </div>
          <div className="p-6 space-y-4 text-sm text-gray-200">
            <div>
              <span className="block text-theme-text-muted text-xs mb-1">GSTIN</span>
              <span className="font-medium">{vendor.gstin || "Not provided"}</span>
            </div>
            <div>
              <span className="block text-theme-text-muted text-xs mb-1">PAN</span>
              <span className="font-medium">{vendor.pan || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden md:col-span-2">
          <div className="px-6 py-4 border-b border-theme-border bg-theme-surface-hover">
            <h3 className="text-sm font-bold text-theme-text">Address Details</h3>
          </div>
          <div className="p-6 text-sm text-gray-200">
            {vendor.address ? (
              <div className="space-y-1">
                <p>{vendor.address}</p>
                <p>{vendor.city}{vendor.city && vendor.state ? ", " : ""}{vendor.state}</p>
                {vendor.stateCode && <p className="text-xs text-theme-text-muted mt-2">State Code: {vendor.stateCode}</p>}
              </div>
            ) : (
              <p className="text-theme-text-muted italic">No address provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
