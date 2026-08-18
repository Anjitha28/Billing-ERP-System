import { requireAuth } from '@/lib/auth-utils';
import Link from 'next/link';
import { ProformaInvoices } from './ProformaInvoices';
import { ConfirmedInvoices } from './ConfirmedInvoices';
import { OptimisticTabs } from '@/components/OptimisticTabs';

export default async function InvoicesHubPage({
  searchParams
}: {
  searchParams: { tab?: string; [key: string]: any }
}) {
  await requireAuth();

  // Await searchParams per Next.js 16 requirements
  const params = await Promise.resolve(searchParams);
  const activeTab = params.tab || 'proforma';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Invoices</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Manage both draft estimates (Proforma) and finalized Tax Invoices.</p>
        </div>
      </div>

      {/* Tabs */}
      <OptimisticTabs 
        basePath="/invoices"
        defaultTab="proforma"
        tabs={[
          { id: "proforma", label: "Proforma Invoice" },
          { id: "confirmed", label: "Confirmed Invoice" }
        ]}
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'proforma' ? (
          <ProformaInvoices />
        ) : (
          <ConfirmedInvoices searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
