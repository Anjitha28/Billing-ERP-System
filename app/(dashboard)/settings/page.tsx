import { requireAdmin } from '@/lib/auth-utils';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Settings</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Manage application preferences and configurations.</p>
        </div>
      </div>
      <SettingsClient />
    </div>
  )
}

