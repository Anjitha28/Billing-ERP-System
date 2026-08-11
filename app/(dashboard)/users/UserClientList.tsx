'use client';

import { useState, useTransition } from 'react';
import { createUser, updateUser, toggleUserStatus, resetUserPassword } from './actions';

export function UserClientList({ initialUsers }: { initialUsers: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const handleToggleStatus = (id: string, currentlyActive: boolean) => {
    if (confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'activate'} this user?`)) {
      startTransition(async () => {
        const res = await toggleUserStatus(id, currentlyActive);
        if (res.error) alert(res.error);
      });
    }
  };

  const handleResetPassword = (id: string) => {
    if (confirm('Reset password to "password"? The user will be forced to change it on login.')) {
      startTransition(async () => {
        const res = await resetUserPassword(id);
        if (res.error) alert(res.error);
        else alert('Password reset successfully.');
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      let res;
      if (editingUser) {
        res = await updateUser(editingUser.id, formData);
      } else {
        res = await createUser(formData);
      }
      if (res.error) {
        alert(res.error);
      } else {
        setShowModal(false);
        setEditingUser(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-theme-primary text-white rounded-lg shadow hover:bg-theme-primary-dark text-sm font-medium"
        >
          + Create User
        </button>
      </div>

      <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden">
        <table className="min-w-full divide-y divide-theme-border">
          <thead className="bg-theme-surface-hover text-xs font-medium text-theme-text-muted uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email ID</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-center">Account Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface divide-y divide-theme-border text-sm">
            {initialUsers.map((user) => (
              <tr key={user.id} className={!user.isActive ? 'bg-theme-surface-hover opacity-75' : ''}>
                <td className="px-6 py-4 font-medium text-theme-text">
                  {user.name}
                  {user.mustResetPassword && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Reset
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-theme-text-muted">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-theme-surface-hover text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setShowModal(true);
                    }}
                    className="text-theme-text-muted hover:text-theme-primary font-medium"
                    disabled={isPending}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`font-medium ${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                    disabled={isPending}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    className="text-theme-text-muted hover:text-theme-text font-medium ml-2"
                    disabled={isPending}
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-theme-surface rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingUser?.name} 
                  required 
                  className="mt-1 block w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:ring-theme-primary focus:border-theme-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text">Email ID</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingUser?.email} 
                  required 
                  className="mt-1 block w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:ring-theme-primary focus:border-theme-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text">Role</label>
                <select 
                  name="role" 
                  defaultValue={editingUser?.role || 'USER'} 
                  className="mt-1 block w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:ring-theme-primary focus:border-theme-primary"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              
              {!editingUser && (
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md">
                  Note: The default password will be set to <strong>password</strong> and the user will be forced to change it on their first login.
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-theme-border rounded-lg text-theme-text hover:bg-theme-surface-hover text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
