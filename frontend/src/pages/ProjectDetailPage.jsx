import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/project.service';
import { adminService } from '../services/admin.service';
import { interactionService } from '../services/interaction.service';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Search, Heart, Eye } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Selected gallery image for modal preview
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      const response = await projectService.getProjectById(id);
      setProject(response.data?.data || null);
    } catch (error) {
      console.error('Failed to load project details:', error);
      toast.error('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('You must be signed in to like a project. ❌');
      return;
    }
    if (isOwner) return;

    try {
      const response = await interactionService.toggleLike(id);
      const likedNow = response.data?.data?.liked;
      setProject((prev) => {
        if (!prev) return prev;
        const currentLikes = prev.likeCount || 0;
        return {
          ...prev,
          isLiked: likedNow,
          likeCount: likedNow ? currentLikes + 1 : Math.max(0, currentLikes - 1),
        };
      });
      toast.success(likedNow ? 'Added to your liked projects.' : 'Removed from your liked projects.');
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Could not complete like action.');
    }
  };

  // Owner action triggers
  const handleOwnerHide = async () => {
    if (!window.confirm('Are you sure you want to hide this project?')) return;
    setActionLoading(true);
    try {
      await projectService.hideProject(id);
      toast.success('Project hidden successfully.');
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      toast.error('Failed to hide project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerResubmit = async () => {
    if (!window.confirm('Resubmit this project for staff review?')) return;
    setActionLoading(true);
    try {
      await projectService.resubmitProject(id);
      toast.success('Project resubmitted for review.');
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      toast.error('Failed to resubmit project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      if (isAdmin) {
        await adminService.deleteProject(id);
        toast.success('Project deleted successfully.');
        navigate('/admin/dashboard');
      } else {
        await projectService.deleteProject(id);
        toast.success('Project deleted successfully.');
        navigate('/profile');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project.');
    } finally {
      setActionLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Admin action triggers
  const handleAdminApprove = async () => {
    if (!window.confirm('Approve this project for showcase?')) return;
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(id, { status: 'APPROVED' });
      toast.success('Project approved and is now live.');
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReasonText.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(id, {
        status: 'REJECTED',
        rejectionReason: rejectionReasonText.trim(),
      });
      toast.success('Project rejected. The author has been notified.');
      setIsRejectModalOpen(false);
      setRejectionReasonText('');
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject project.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminHide = async () => {
    if (!window.confirm('Hide this project from the showcase feed?')) return;
    setActionLoading(true);
    try {
      await adminService.updateProjectStatus(id, { status: 'HIDDEN' });
      toast.success('Project hidden successfully.');
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
      toast.error('Failed to hide project.');
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

  if (!project) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
          <Search size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          We couldn't retrieve the details for this project. It may have been deleted or is pending review.
        </p>
        <Link to="/projects" className="text-violet-600 hover:underline font-bold text-sm block">
          Browse Projects
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    coverImage,
    images = [],
    category,
    status,
    techStack = [],
    demoLink,
    githubLink,
    likeCount = 0,
    viewCount = 0,
    isLiked = false,
    owner,
    rejectionReason,
  } = project;

  const currentUserId = user?._id || user?.id || user?.userId;
  const isOwner = currentUserId && owner && (owner._id === currentUserId || owner.id === currentUserId || owner === currentUserId);
  const isAdmin = user?.role === 'ADMIN';
  const showStatusBadge = isOwner || isAdmin;

  const getStatusBadgeColor = (stat) => {
    switch (stat) {
      case 'APPROVED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': return 'red';
      case 'HIDDEN': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      
      {/* 1. Full-Width Cover Image */}
      <div className="w-full h-80 sm:h-96 md:h-[400px] overflow-hidden relative border-b border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Below Cover content split layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Project Details */}
        <section className="lg:col-span-8 space-y-8">
          {status === 'REJECTED' && isOwner && rejectionReason && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 shadow-xxs animate-in slide-in-from-top duration-200">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-400">Submission Rejected</h4>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                  Reason: {rejectionReason}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="violet">{category}</Badge>
              {showStatusBadge && (
                <Badge color={getStatusBadgeColor(status)}>{status}</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white leading-tight">
              {title}
            </h1>

            {/* Student Info Row */}
            {owner ? (
              <div className="flex items-center gap-3 py-2 border-y border-gray-100 dark:border-gray-700">
                <Link to={`/users/${owner._id || owner.id}`}>
                  <Avatar src={owner.profilePicture} name={owner.name} size="md" />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/users/${owner._id || owner.id}`}
                    className="font-bold text-sm text-gray-900 dark:text-white hover:text-violet-600 hover:underline block"
                  >
                    {owner.name}
                  </Link>
                  {owner.university && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{owner.university}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Anonymous author</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">About the Project</h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-light">
              {description}
            </p>
          </div>

          {/* Tech Stack Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Screenshot Gallery */}
          {images && images.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gallery</h3>
              <div className="flex overflow-x-auto gap-4 pb-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 snap-x">
                {images.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveGalleryImage(imgUrl)}
                    className="shrink-0 w-64 h-36 sm:w-80 sm:h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xxs snap-start bg-gray-50 dark:bg-gray-900 cursor-zoom-in"
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery screenshot ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Action Sidebar (Sticky) */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
            
            {/* Interactive Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* Like heart button */}
              <button
                onClick={handleLike}
                disabled={isOwner}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  isLiked
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-500'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/10 hover:text-rose-500 hover:border-rose-200'
                } disabled:opacity-50`}
                title={isOwner ? 'You cannot like your own project.' : ''}
              >
                <Heart
                  size={22}
                  className={`mb-1 transition-all ${
                    isLiked ? 'fill-rose-500 stroke-rose-500' : 'stroke-current'
                  }`}
                />
                <span className="text-sm font-black text-gray-900 dark:text-white">{likeCount}</span>
                <span className="text-xxs uppercase tracking-wider text-gray-400 mt-0.5">Likes</span>
              </button>

              {/* View count */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <Eye size={22} className="mb-1" />
                <span className="text-sm font-black text-gray-900 dark:text-white">{viewCount}</span>
                <span className="text-xxs uppercase tracking-wider text-gray-400 mt-0.5">Views</span>
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-3 pt-2">
              {demoLink && (
                <a
                  href={demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors text-center text-sm shadow-xs block"
                >
                  View Live Demo
                </a>
              )}
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-center text-sm block"
                >
                  GitHub Repository
                </a>
              )}
            </div>

            {/* Contextual User & Admin Actions Section */}
            {(isOwner || isAdmin) && (
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-2">Moderation & Controls</p>
                
                {/* STUDENT/OWNER actions */}
                {isOwner && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/projects/${id}/edit`)}
                      disabled={actionLoading}
                      className="w-full font-semibold text-sm"
                    >
                      Edit Project
                    </Button>
                    
                    {status === 'APPROVED' && (
                      <Button
                        variant="secondary"
                        onClick={handleOwnerHide}
                        loading={actionLoading}
                        disabled={actionLoading}
                        className="w-full font-semibold text-sm"
                      >
                        Hide Project
                      </Button>
                    )}

                    {(status === 'REJECTED' || status === 'HIDDEN') && (
                      <Button
                        variant="primary"
                        onClick={handleOwnerResubmit}
                        loading={actionLoading}
                        disabled={actionLoading}
                        className="w-full font-bold text-sm bg-violet-600 hover:bg-violet-700"
                      >
                        Resubmit Project
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={actionLoading}
                      className="w-full font-semibold text-sm"
                    >
                      Delete Project
                    </Button>
                  </>
                )}

                {/* ADMIN actions */}
                {isAdmin && (
                  <>
                    {(status === 'PENDING' || status === 'HIDDEN') && (
                      <Button
                        variant="primary"
                        onClick={handleAdminApprove}
                        loading={actionLoading}
                        disabled={actionLoading}
                        className="w-full font-bold text-sm bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve Project
                      </Button>
                    )}

                    {status === 'PENDING' && (
                      <Button
                        variant="danger"
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="w-full font-bold text-sm"
                      >
                        Reject Project
                      </Button>
                    )}

                    {status === 'APPROVED' && (
                      <Button
                        variant="secondary"
                        onClick={handleAdminHide}
                        loading={actionLoading}
                        disabled={actionLoading}
                        className="w-full font-semibold text-sm"
                      >
                        Hide Project
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={actionLoading}
                      className="w-full font-semibold text-sm"
                    >
                      Delete Project
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* 3. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Are you sure you want to permanently delete this project? This action cannot be undone.
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

      {/* 4. Admin Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reason for Rejection"
      >
        <form onSubmit={handleAdminRejectSubmit} className="space-y-4">
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

      {/* 5. Lightbox Modal for Gallery Images */}
      {activeGalleryImage && (
        <div
          onClick={() => setActiveGalleryImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
        >
          <div className="max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={activeGalleryImage}
              alt="Project screenshot enlarge"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

    </div>
  );
}
