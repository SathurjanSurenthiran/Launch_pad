import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin.service';
import Spinner from '../../components/ui/Spinner';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import useDebounce from '../../hooks/useDebounce';
import { getRoleBadge, getStatusBadge } from '../../utils/badges';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  // Data loading states
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [searchVal, setSearchVal] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(searchVal, 400);

  // User Detail modal states
  const [detailedUser, setDetailedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Confirm modal states for deactivation / reactivation
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'deactivate' | 'reactivate'
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 20,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter || undefined,
      };

      const response = await adminService.getUsers(params);
      setUsers(response.data?.data?.users || []);
      setPagination(response.data?.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load users list:', error);
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter]);

  // Reload when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handleViewUser = async (userId) => {
    setLoadingDetails(true);
    setIsDetailModalOpen(true);
    try {
      const response = await adminService.getUserById(userId);
      setDetailedUser(response.data?.data || null);
    } catch (error) {
      console.error('Failed to load user detailed profile:', error);
      toast.error('Failed to load profile details.');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    const isSelf = currentUser?._id === userId || currentUser?.id === userId || currentUser?.userId === userId;
    if (isSelf) return;

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      fetchUsers(page); // reload to reset dropdown state in UI
      return;
    }

    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('User role changed successfully!');
      fetchUsers(page);
    } catch (error) {
      console.error('Failed to change user role:', error);
      toast.error(error.response?.data?.message || 'Failed to update user role.');
      fetchUsers(page);
    }
  };

  const openConfirmModal = (userObj, actionType) => {
    setSelectedUser(userObj);
    setConfirmAction(actionType);
    setIsConfirmOpen(true);
  };

  const handleReactivate = async (userObj) => {
    setActionLoading(true);
    const toastId = toast.loading(`Reactivating ${userObj.name}...`);
    try {
      const userId = userObj._id || userObj.id;
      await adminService.reactivateUser(userId);
      toast.success('Account reactivated successfully.', { id: toastId });
      fetchUsers(page);
    } catch (error) {
      console.error('Failed to reactivate account:', error);
      toast.error('Failed to reactivate account.', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const userId = selectedUser._id || selectedUser.id;
      if (confirmAction === 'deactivate') {
        await adminService.deactivateUser(userId);
        toast.success('Account deactivated and projects hidden.');
      }
      setIsConfirmOpen(false);
      fetchUsers(page);
    } catch (error) {
      console.error('Failed to execute account change action:', error);
      toast.error('Failed to execute action.');
    } finally {
      setActionLoading(false);
    }
  };

  const getConfirmMessage = () => {
    return 'Deactivating a user will restrict them from signing in and block their public content from visibility.';
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          User Moderation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
          Search, update roles, or suspend/restore student and recruiter accounts.
        </p>
      </div>

      {/* Top filter row */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Role select */}
        <div className="md:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="RECRUITER">RECRUITER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {/* Status select */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <span className="text-5xl block">👥</span>
          <p className="text-gray-500 dark:text-gray-400 mt-3">No user accounts found matching query.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-850">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isSelf = currentUser?._id === uId || currentUser?.id === uId || currentUser?.userId === uId;
                    return (
                      <tr key={uId} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar src={u.profilePicture} name={u.name} size="sm" />
                            <span className="text-sm font-bold text-gray-905 dark:text-white truncate max-w-[150px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(u.isActive ? 'APPROVED' : 'HIDDEN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleViewUser(uId)}
                            className="text-indigo-600 hover:text-indigo-805 dark:text-indigo-400 font-semibold"
                          >
                            View
                          </button>

                          {/* Role Selector dropdown */}
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(uId, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 disabled:opacity-50"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="RECRUITER">RECRUITER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          {/* Toggle access status button */}
                          {u.isActive ? (
                            <button
                              onClick={() => openConfirmModal(u, 'deactivate')}
                              className="text-red-650 hover:text-red-800 dark:text-red-400 font-semibold text-xs"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(u)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 font-semibold text-xs"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users.map((u) => {
              const uId = u._id || u.id;
              const isSelf = currentUser?._id === uId || currentUser?.id === uId || currentUser?.userId === uId;
              return (
                <div key={uId} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.profilePicture} name={u.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-905 dark:text-white truncate">{u.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {getRoleBadge(u.role)}
                    {getStatusBadge(u.isActive ? 'APPROVED' : 'HIDDEN')}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center justify-between pt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(uId)} className="font-bold text-xs">
                      View Profile
                    </Button>

                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(uId, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-705"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="RECRUITER">RECRUITER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {u.isActive ? (
                        <Button variant="danger" size="sm" onClick={() => openConfirmModal(u, 'deactivate')} className="text-xs font-bold py-1">
                          Deactivate
                        </Button>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => handleReactivate(u)} className="text-xs font-bold py-1 bg-green-600 hover:bg-green-700">
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Pagination */}
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Modal Profile Viewer */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Full User Account Details"
      >
        {loadingDetails ? (
          <div className="py-12 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : detailedUser ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={detailedUser.profilePicture} name={detailedUser.name} size="md" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {detailedUser.name}
                </h3>
                <p className="text-xs text-gray-500">{detailedUser.email}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {getRoleBadge(detailedUser.role)}
                  {getStatusBadge(detailedUser.isActive ? 'APPROVED' : 'HIDDEN')}
                </div>
              </div>
            </div>

            {/* Structured details */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">University</p>
                <p className="font-semibold text-gray-805 dark:text-gray-200">{detailedUser.university || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Department</p>
                <p className="font-semibold text-gray-805 dark:text-gray-200">{detailedUser.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Graduation Year</p>
                <p className="font-semibold text-gray-805 dark:text-gray-200">{detailedUser.graduationYear || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Project Count</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">{detailedUser.projectCount || 0}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                <p className="font-semibold text-gray-805 dark:text-gray-200">
                  {new Date(detailedUser.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1">Biography</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                {detailedUser.bio || 'This user has not written a biography.'}
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close Panel
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Confirm suspension status Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleActionConfirm}
        title={confirmAction === 'deactivate' ? 'Deactivate User Account' : 'Reactivate User Account'}
        message={getConfirmMessage()}
        confirmLabel={confirmAction === 'deactivate' ? 'Deactivate Account' : 'Reactivate Account'}
        confirmVariant={confirmAction === 'deactivate' ? 'danger' : 'primary'}
        isLoading={actionLoading}
      />
    </div>
  );
}
