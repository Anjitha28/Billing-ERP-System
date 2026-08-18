import { requireAdmin } from '@/lib/auth-utils';
import { OptimisticTabs } from '@/components/OptimisticTabs';
import { RevenueLedger } from './RevenueLedger';
import { UnifiedLedger } from './UnifiedLedger';

export default async function FinanceHubPage({
  searchParams
}: {
  searchParams: { tab?: string; [key: string]: any }
}) {
  await requireAdmin();

  // Await searchParams per Next.js 16 requirements
  const params = await Promise.resolve(searchParams);
  const activeTab = params.tab || 'revenue';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Finance</h1>
        <p className="text-theme-text-muted mt-1">Access detailed financial transaction ledgers and accounting records.</p>
      </div>

      {/* Tabs */}
      <OptimisticTabs 
        basePath="/finance"
        defaultTab="revenue"
        tabs={[
          { id: "revenue", label: "Revenue Ledger" },
          { id: "unified", label: "Unified Ledger" }
        ]}
      />

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'revenue' ? (
          <RevenueLedger searchParams={params as any} />
        ) : (
          <UnifiedLedger searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
