import { requireAuth } from '@/lib/auth-utils';

export default async function UserHomePage() {
  const session = await requireAuth();
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Welcome, {session?.user?.name}!</h1>
          <p className="text-theme-text-muted mt-1 text-sm">
            This is your User Dashboard. You have been successfully authenticated.
          </p>
        </div>
      </div>
      
      <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/invoices" className="block p-4 border border-theme-border rounded-lg hover:border-theme-primary hover:shadow-sm transition group">
            <h3 className="font-medium text-theme-text group-hover:text-theme-primary">Manage Invoices &rarr;</h3>
            <p className="text-sm text-theme-text-muted mt-1">Create and track customer invoices</p>
          </a>
          <a href="/expenses" className="block p-4 border border-theme-border rounded-lg hover:border-theme-primary hover:shadow-sm transition group">
            <h3 className="font-medium text-theme-text group-hover:text-theme-primary">Record Expenses &rarr;</h3>
            <p className="text-sm text-theme-text-muted mt-1">Log business expenses and bills</p>
          </a>
        </div>
      </div>
    </div>
  );
}
