import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Status Filter Sync with URL search params (default to ALL which is empty string)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  // Modal actions states
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProjects = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 10,
        status: statusFilter || undefined,
      };

      const response = await adminService.getProjects(params);
      setProjects(response.data?.data?.projects || []);
      setPagination(response.data?.data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load projects for admin review:', error);
      toast.error('Failed to load project submissions.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchProjects(page);
  }, [page, fetchProjects]);

  const handleTabChange = (status) => {
    setStatusFilter(status);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleApprove = async (proj) => {
    if (!window.confirm(`Approve project "${proj.title}"?`)) return;
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(proj._id || proj.id, { status: 'APPROVED' });
      toast.success('Project approved and is now live.');
      fetchProjects(page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHide = async (proj) => {
    if (!window.confirm(`Hide project "${proj.title}"?`)) return;
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(proj._id || proj.id, { status: 'HIDDEN' });
      toast.success('Project hidden successfully.');
      fetchProjects(page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to hide project.');
    } finally {
      setActionLoading(false);
    }
  };

  const triggerRejectModal = (proj) => {
    setSelectedProject(proj);
    setRejectionReasonText('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReasonText.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(selectedProject._id || selectedProject.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReasonText.trim(),
      });
      toast.success('Project rejected. The author has been notified.');
      setIsRejectModalOpen(false);
      setSelectedProject(null);
      fetchProjects(page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject project.');
    } finally {
      setActionLoading(false);
    }
  };

  const triggerDeleteModal = (proj) => {
    setSelectedProject(proj);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteProject(selectedProject._id || selectedProject.id);
      toast.success('Project deleted successfully.');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      fetchProjects(page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (stat) => {
    switch (stat) {
      case 'APPROVED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': return 'red';
      case 'HIDDEN': return 'gray';
      default: return 'gray';
    }
  };

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Hidden', value: 'HIDDEN' },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Project Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
          Review, approve, hide, or delete student showcase submissions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700 gap-2 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === tab.value
                ? 'border-violet-650 text-violet-650 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects List Container */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xxs">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 mx-auto">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">No project submissions found.</p>
        </div>
      ) : (
        <>
          {/* Table view */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-850">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thumbnail</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {projects.map((p) => {
                    const pId = p._id || p.id;
                    return (
                      <tr key={pId} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={p.coverImage}
                            alt="Cover"
                            className="w-12 h-8 rounded-md object-cover border border-gray-100 dark:border-gray-700 bg-gray-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/projects/${pId}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-violet-650 hover:underline truncate max-w-[180px] block">
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {p.owner?.name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge color={getStatusBadgeColor(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          {/* Actions based on status */}
                          {p.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(p)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-800 font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => triggerRejectModal(p)}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-800 font-bold"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {p.status === 'APPROVED' && (
                            <button
                              onClick={() => handleHide(p)}
                              disabled={actionLoading}
                              className="text-gray-500 hover:text-gray-700 font-bold"
                            >
                              Hide
                            </button>
                          )}

                          {p.status === 'HIDDEN' && (
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-800 font-bold"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => triggerDeleteModal(p)}
                            disabled={actionLoading}
                            className="text-red-700 hover:text-red-900 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {projects.map((p) => {
              const pId = p._id || p.id;
              return (
                <div key={pId} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={p.coverImage} alt="Cover" className="w-14 h-10 rounded-lg object-cover border border-gray-100 bg-gray-50" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/projects/${pId}`} className="font-bold text-sm text-gray-905 truncate block hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xxs text-gray-500 truncate">by {p.owner?.name || 'Anonymous'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <Badge color={getStatusBadgeColor(p.status)}>{p.status}</Badge>
                    <span className="text-xxs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-1">
                    {p.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(p)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-xxs border border-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => triggerRejectModal(p)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-705 font-bold rounded-lg text-xxs border border-red-200"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {p.status === 'APPROVED' && (
                      <button
                        onClick={() => handleHide(p)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-xxs border border-gray-200"
                      >
                        Hide
                      </button>
                    )}

                    {p.status === 'HIDDEN' && (
                      <button
                        onClick={() => handleApprove(p)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-lg text-xxs border border-green-200"
                      >
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => triggerDeleteModal(p)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xxs border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reason for Rejection"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Rejection Reason (Required)</label>
            <textarea
              required
              rows="3"
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={actionLoading}
              disabled={actionLoading}
              className="font-bold"
            >
              Confirm Reject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project submission"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Are you sure you want to permanently delete this project? <strong>This action cannot be undone.</strong>
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={actionLoading}
              disabled={actionLoading}
              className="font-bold"
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
