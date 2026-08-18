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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Invoices</h1>
        <p className="text-theme-text-muted mt-1">Manage both draft estimates (Proforma) and finalized Tax Invoices.</p>
      </div>

      {/* Tabs */}
      <OptimisticTabs 
        basePath="/invoices"
        defaultTab="proforma"
        tabs={[
          { id: "proforma", label: "Proforma Invoice" },
          { id: "confirmed", label: "Confirmed Invoice" },
          { id: "purchase_order", label: "Purchase Order" }
        ]}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'proforma' ? (
          <ProformaInvoices />
        ) : activeTab === 'confirmed' ? (
          <ConfirmedInvoices searchParams={params as any} />
        ) : (
          <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-theme-text-muted opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-theme-text mb-2">Purchase Orders</h3>
            <p className="text-theme-text-muted">Purchase Order functionality is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
