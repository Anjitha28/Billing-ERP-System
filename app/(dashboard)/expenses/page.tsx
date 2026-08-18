import { requireAuth } from '@/lib/auth-utils';
import { OptimisticTabs } from '@/components/OptimisticTabs';
import { ExpensesList } from './ExpensesList';
import { ExpenseCategories } from './ExpenseCategories';

export default async function ExpensesHubPage({
  searchParams
}: {
  searchParams: { tab?: string; [key: string]: any }
}) {
  await requireAuth();

  // Await searchParams per Next.js 16 requirements
  const params = await Promise.resolve(searchParams);
  const activeTab = params.tab || 'list';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Expenses</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Manage and track your business expenses and expense categories.</p>
        </div>
      </div>

      {/* Tabs */}
      <OptimisticTabs 
        basePath="/expenses"
        defaultTab="list"
        tabs={[
          { id: "list", label: "Expenses" },
          { id: "categories", label: "Expense Categories" }
        ]}
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'list' ? (
          <ExpensesList searchParams={params as any} />
        ) : (
          <ExpenseCategories searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
