import { requireAuth } from '@/lib/auth-utils';
import Link from 'next/link';
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Expenses</h1>
        <p className="text-theme-text-muted mt-1">Manage and track your business expenses and expense categories.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/expenses?tab=list"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'list'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-theme-text hover:border-theme-border'
              }
            `}
          >
            Expenses
          </Link>
          <Link
            href="/expenses?tab=categories"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'categories'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-theme-text hover:border-theme-border'
              }
            `}
          >
            Expense Categories
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'list' ? (
          <ExpensesList searchParams={params as any} />
        ) : (
          <ExpenseCategories searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
