import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Inline rejection state
  const [rejectingProjectId, setRejectingProjectId] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await adminService.getDashboard();
      setStats(statsRes.data?.data || null);

      // 2. Fetch Pending Projects (Limit 5)
      const projectsRes = await adminService.getProjects({ status: 'PENDING', limit: 5 });
      setPendingProjects(projectsRes.data?.data?.projects || []);

      // 3. Fetch Recent Users (Limit 5)
      const usersRes = await adminService.getUsers({ limit: 5 });
      setRecentUsers(usersRes.data?.data?.users || []);
    } catch (error) {
      console.error('Failed to load dashboard details:', error);
      toast.error('Failed to load dashboard overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this project?')) return;
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(id, { status: 'APPROVED' });
      toast.success('Project approved and is now live.');
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (id) => {
    if (!rejectionReasonText.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(id, {
        status: 'REJECTED',
        rejectionReason: rejectionReasonText.trim(),
      });
      toast.success('Project rejected. The author has been notified.');
      setRejectingProjectId(null);
      setRejectionReasonText('');
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject project.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          System performance metrics and pending moderation queues.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-450">Total Users</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {stats?.totalUsers || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        {/* Total Projects */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-450">Total Projects</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {stats?.totalProjects || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* Pending review */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-450">Pending Review</p>
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {stats?.pendingProjects || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold uppercase tracking-wider text-gray-450">Total Likes</p>
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {stats?.totalLikes || 0}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 dark:text-rose-400">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Side-by-Side queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Pending Projects List */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              Pending Projects
            </h3>
            <Link to="/admin/projects?status=PENDING" className="text-xs font-bold text-violet-600 hover:underline">
              View All Projects
            </Link>
          </div>

          {pendingProjects.length === 0 ? (
            <div className="text-center py-10 italic text-gray-450 text-sm">
              No projects awaiting moderation.
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-700">
              {pendingProjects.map((proj, index) => (
                <div key={proj._id} className={`pt-4 ${index === 0 ? 'pt-0' : ''} space-y-3`}>
                  <div className="flex items-start gap-4">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-20 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 dark:border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/projects/${proj._id}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-violet-600 hover:underline truncate block">
                        {proj.title}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        by {proj.owner?.name || 'Student Builder'} • {new Date(proj.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {rejectingProjectId !== proj._id && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(proj._id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 text-xxs bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg transition-colors border border-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingProjectId(proj._id);
                            setRejectionReasonText('');
                          }}
                          disabled={actionLoading}
                          className="px-2.5 py-1 text-xxs bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors border border-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Rejection Input Panel */}
                  {rejectingProjectId === proj._id && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 animate-in slide-in-from-top-2 duration-150">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rejection Reason (Required)</label>
                        <textarea
                          required
                          rows="2"
                          value={rejectionReasonText}
                          onChange={(e) => setRejectionReasonText(e.target.value)}
                          placeholder="Provide feedback on why this submission was rejected..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingProjectId(null);
                            setRejectionReasonText('');
                          }}
                          className="px-2.5 py-1 text-xxs border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectSubmit(proj._id)}
                          className="px-2.5 py-1 text-xxs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Recent Registered Users */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              Recent Users
            </h3>
            <Link to="/admin/users" className="text-xs font-bold text-violet-600 hover:underline">
              View All Users
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-10 italic text-gray-450 text-sm">
              No registered users.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-700">
              {recentUsers.map((userObj, index) => (
                <div key={userObj._id} className={`flex items-center gap-3 pt-3 ${index === 0 ? 'pt-0' : ''}`}>
                  <Avatar src={userObj.profilePicture} name={userObj.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {userObj.name}
                    </h4>
                    <p className="text-xxs text-gray-500 dark:text-gray-400 truncate">
                      {userObj.email}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge color={userObj.role === 'ADMIN' ? 'red' : userObj.role === 'RECRUITER' ? 'green' : 'violet'}>
                      {userObj.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
