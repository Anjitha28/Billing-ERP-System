import { requireAdmin } from '@/lib/auth-utils';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsClient />
    </div>
  )
}

