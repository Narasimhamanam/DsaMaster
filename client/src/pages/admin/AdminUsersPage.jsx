import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Shield, User, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

  // Fetch users with query params
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: async () => {
      const { data } = await adminService.getUsers({
        page,
        search,
        role: roleFilter,
        limit: 15,
      });
      return data || { users: [], total: 0, pages: 1 };
    },
  });

  // Mutate user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await adminService.updateUserRole(userId, role);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User role updated successfully! 🛡️');
    },
    onError: () => {
      toast.error('Failed to update user role.');
    },
  });

  // Mutate delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const { data } = await adminService.deleteUser(userId);
      return data;
    },
    onSuccess: () => {
      setSelectedUserForDelete(null);
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User profile terminated from platform database.');
    },
    onError: () => {
      toast.error('Failed to delete user.');
    },
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteConfirm = (e) => {
    e.preventDefault();
    if (!selectedUserForDelete) return;
    deleteUserMutation.mutate(selectedUserForDelete._id);
  };

  const users = usersData?.users || [];
  const totalPages = usersData?.pages || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary">
          User Management
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Inspect platform users, audit details, change roles, or terminate database entries.
        </p>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-bg-secondary/20 p-4 rounded-xl border border-bg-border/40">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Name or Email..."
            className="input w-full pl-10 text-xs py-2"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="bg-bg-hover text-xs text-text-secondary border border-bg-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Administrators</option>
        </select>

        <button
          onClick={() => toast.success('Bulk actions will be enabled in the production patch.')}
          className="btn-secondary py-2 text-xs font-bold w-full"
        >
          Bulk Actions
        </button>
      </div>

      {/* Cohort Table */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse pt-4">
          <div className="h-48 bg-bg-card rounded-2xl w-full" />
        </div>
      ) : (
        <div className="glass-card bg-bg-secondary/40 border-bg-border/60 overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-bg-border/60 text-xs font-semibold text-text-muted bg-bg-secondary/20">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">College</th>
                  <th className="p-4 text-center">Role</th>
                  <th className="p-4 text-center">Solved</th>
                  <th className="p-4 text-center">XP</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-text-muted text-sm font-medium">
                      No matching user records.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item._id || item.uid} className="border-b border-bg-border/30 hover:bg-bg-hover/30 transition-colors text-xs">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photoURL || 'https://via.placeholder.com/150'}
                            alt={item.name}
                            className="w-8 h-8 rounded-full border border-bg-border flex-shrink-0 object-cover"
                          />
                          <span className="font-bold text-text-primary block truncate max-w-[120px]">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-text-secondary font-medium">
                        {item.email}
                      </td>

                      <td className="p-4 text-text-secondary font-semibold">
                        {item.college || 'N/A'}
                      </td>

                      <td className="p-4 text-center">
                        <select
                          value={item.role || 'student'}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          className="bg-bg-hover text-[11px] font-semibold border border-bg-border rounded px-2 py-1 text-brand-300 focus:outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="p-4 text-center font-bold text-text-secondary">
                        {item.totalSolved || 0}
                      </td>

                      <td className="p-4 text-center font-bold text-brand-400">
                        {item.xp || 0}
                      </td>

                      <td className="p-4 text-text-muted">
                        {dayjs(item.createdAt).format('D MMM YYYY')}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedUserForDelete(item)}
                          className="bg-bg-hover hover:bg-red-500/10 border border-bg-border hover:border-red-500/25 p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-all inline-flex items-center justify-center cursor-pointer"
                          title="Terminate Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-bg-border/30 bg-bg-secondary/20 flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Showing Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-bg-hover border border-bg-border px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-bg-hover border border-bg-border px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete User Modal */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleDeleteConfirm}
            className="w-full max-w-sm bg-bg-secondary border border-bg-border p-6 rounded-2xl shadow-xl space-y-4"
          >
            <div>
              <h3 className="font-bold text-text-primary text-base">Confirm Account Deletion</h3>
              <p className="text-text-muted text-xs mt-1">
                Are you sure you want to terminate <span className="font-semibold text-text-primary">{selectedUserForDelete.name}</span>? This action is permanent and clears all progress metrics.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForDelete(null)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleteUserMutation.isPending}
                className="btn-primary px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 border-red-500"
              >
                {deleteUserMutation.isPending ? 'Terminating...' : 'Yes, Delete Account'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );
}
