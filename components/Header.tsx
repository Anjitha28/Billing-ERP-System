import { auth } from '@/auth';
import { LogoutButton } from './LogoutButton';
export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-theme-surface border-b border-theme-border h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-theme-text">Billing ERP System</h1>
      <div className="flex items-center space-x-6">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-theme-text">{user?.name || 'Guest'}</span>
          <span className="text-xs text-theme-text-muted">{(user as any)?.role || 'USER'}</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-theme-primary flex items-center justify-center text-white font-bold uppercase">
          {user?.name?.[0] || 'G'}
        </div>
        
        {user && (
          <LogoutButton />
        )}
      </div>
    </header>
  );
}
