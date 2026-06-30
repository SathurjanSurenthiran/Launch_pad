import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { projectService } from '../services/project.service';
import { notificationService } from '../services/notification.service';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Pagination from '../components/ui/Pagination';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';

export default function MyProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  // States
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit fields
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'notifications'

  // Student projects states
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPagination, setProjectsPagination] = useState({ page: 1, totalPages: 1 });

  // Notifications states
  const [notificationsList, setNotificationsList] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsPagination, setNotificationsPagination] = useState({ page: 1, totalPages: 1 });

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const response = await userService.getMyProfile();
      const prof = response.data?.data;
      setProfile(prof || null);

      if (prof) {
        setBio(prof.bio || '');
        setUniversity(prof.university || '');
        setDepartment(prof.department || '');
        setGraduationYear(prof.graduationYear || '');
      }
    } catch (error) {
      console.error('Failed to load self profile details:', error);
      toast.error('Could not load profile details.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchProjects = useCallback(async (pageNum) => {
    const myId = user?._id || user?.id || user?.userId;
    if (!myId || user?.role !== 'STUDENT') return;

    setLoadingProjects(true);
    try {
      const response = await userService.getUserProjects(myId, { page: pageNum, limit: 6 });
      const data = response.data?.data;
      setProjectsList(data?.projects || []);
      setProjectsPagination(data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load user projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async (pageNum) => {
    setLoadingNotifications(true);
    try {
      const response = await notificationService.getNotifications({ page: pageNum, limit: 10 });
      const data = response.data?.data;
      setNotificationsList(data?.notifications || []);
      setNotificationsPagination(data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user?.role === 'STUDENT' && activeTab === 'projects') {
      fetchProjects(projectsPage);
    } else if (activeTab === 'notifications') {
      fetchNotifications(notificationsPage);
    }
  }, [user, activeTab, projectsPage, notificationsPage, fetchProjects, fetchNotifications]);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await userService.updateMyProfile(formData);
      const updatedData = response.data?.data;

      // Sync auth context and profile state
      const mergedUser = { ...user, ...updatedData };
      login(mergedUser);
      setProfile((prev) => ({ ...prev, ...updatedData }));

      toast.success('Profile picture updated successfully.', { id: toastId });
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload image.', { id: toastId });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        bio: bio.trim(),
        university: university.trim(),
        department: department.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
      };

      const response = await userService.updateMyProfile(payload);
      const updatedData = response.data?.data;

      const mergedUser = { ...user, ...updatedData };
      login(mergedUser);
      setProfile((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);

      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to save profile changes:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProjectAction = async (projectId, actionType) => {
    const toastId = toast.loading(`${actionType} project...`);
    try {
      if (actionType === 'delete') {
        if (!window.confirm('Are you sure you want to permanently delete this project?')) {
          toast.dismiss(toastId);
          return;
        }
        await projectService.deleteProject(projectId);
        toast.success('Project deleted successfully.', { id: toastId });
      } else if (actionType === 'hide') {
        if (!window.confirm('Hide this project from showcase?')) {
          toast.dismiss(toastId);
          return;
        }
        await projectService.hideProject(projectId);
        toast.success('Project hidden successfully.', { id: toastId });
      } else if (actionType === 'resubmit') {
        if (!window.confirm('Resubmit this project for review?')) {
          toast.dismiss(toastId);
          return;
        }
        await projectService.resubmitProject(projectId);
        toast.success('Project resubmitted for review.', { id: toastId });
      }
      fetchProjects(projectsPage);
    } catch (error) {
      console.error(error);
      toast.error('Action failed.', { id: toastId });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All notifications marked as read.');
      fetchNotifications(notificationsPage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to read all notifications.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PROJECT_CREATED': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
      case 'PROJECT_APPROVED': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        </svg>
      );
      case 'PROJECT_REJECTED': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
      case 'PROJECT_HIDDEN': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
      case 'PROJECT_LIKED': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
      case 'USER_FOLLOWED': return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
      default: return (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    if (diffMs < 0) return 'just now';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (loadingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* 1. Header Profile Card */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xxs">
        
        {/* Avatar with hover upload overlay */}
        <div className="relative shrink-0 group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xxs relative">
            <Avatar
              src={profile?.profilePicture}
              name={profile?.name || 'User'}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Upload</span>
            </div>
          </div>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* User profile info */}
        <div className="flex-grow space-y-4 text-center sm:text-left min-w-0">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-black text-gray-950 dark:text-white">
                {profile?.name}
              </h1>
              <div className="inline-flex justify-center">
                <Badge color={profile?.role === 'ADMIN' ? 'red' : profile?.role === 'RECRUITER' ? 'green' : 'violet'}>
                  {profile?.role}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-medium">{profile?.email}</p>
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light whitespace-pre-line">
                {profile?.bio || 'No bio written yet.'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                {profile?.university && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 9l10 6 10-6-10-6zM2 9v6m20-6v6M6 12v5a6 6 0 0 0 12 0v-5" />
                    </svg>
                    {profile.university}
                  </span>
                )}
                {profile?.department && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                    </svg>
                    {profile.department}
                  </span>
                )}
                {profile?.graduationYear && (
                  <span className="flex items-center gap-1">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    Class of {profile.graduationYear}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            /* Inline Edit Profile Form */
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 text-left">
              <div className="space-y-1.5">
                <label className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Describe your goals, experience, and interests..."
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-gray-400 uppercase tracking-wider">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. State University"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xxs font-bold text-gray-400 uppercase tracking-wider">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset fields to profile values
                    setBio(profile?.bio || '');
                    setUniversity(profile?.university || '');
                    setDepartment(profile?.department || '');
                    setGraduationYear(profile?.graduationYear || '');
                  }}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-1.5 bg-violet-600 hover:bg-violet-755 text-white font-bold rounded-lg transition-colors text-xs shadow-xs"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 2. Navigation Tabs (Only student has My Projects tab) */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        {profile?.role === 'STUDENT' && (
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Projects
          </button>
        )}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications
        </button>
      </div>

      {/* 3. Tab Content views */}
      <div className="space-y-6">
        
        {/* Tab: My Projects */}
        {activeTab === 'projects' && profile?.role === 'STUDENT' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Project Submissions</h3>
              <Link to="/projects/new">
                <button className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors text-xs shadow-xs">
                  Create New Project
                </button>
              </Link>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              </div>
            ) : projectsList.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light max-w-xs mx-auto">
                  You have not created any projects yet
                </p>
                <Link to="/projects/new" className="inline-block">
                  <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors text-xs shadow-xs">
                    Create a Project
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projectsList.map((proj) => (
                  <div key={proj._id} className="relative group">
                    <ProjectCard project={proj} />
                    
                    {/* Status Badge overlay is shown inside card, actions below */}
                    <div className="mt-2.5 flex items-center justify-end gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xxs">
                      
                      {/* PENDING -> Edit */}
                      {proj.status === 'PENDING' && (
                        <button
                          onClick={() => navigate(`/projects/${proj._id}/edit`)}
                          className="px-3 py-1 text-xxs font-bold text-gray-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-700 rounded-md"
                        >
                          Edit
                        </button>
                      )}

                      {/* APPROVED -> Edit, Hide */}
                      {proj.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => navigate(`/projects/${proj._id}/edit`)}
                            className="px-3 py-1 text-xxs font-bold text-gray-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-700 rounded-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleProjectAction(proj._id, 'hide')}
                            className="px-3 py-1 text-xxs font-bold text-gray-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-700 rounded-md"
                          >
                            Hide
                          </button>
                        </>
                      )}

                      {/* REJECTED -> Edit, Resubmit */}
                      {proj.status === 'REJECTED' && (
                        <>
                          <button
                            onClick={() => navigate(`/projects/${proj._id}/edit`)}
                            className="px-3 py-1 text-xxs font-bold text-gray-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-700 rounded-md"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleProjectAction(proj._id, 'resubmit')}
                            className="px-3 py-1 text-xxs font-bold text-white bg-violet-650 hover:bg-violet-700 rounded-md"
                          >
                            Resubmit
                          </button>
                        </>
                      )}

                      {/* HIDDEN -> Resubmit, Delete */}
                      {proj.status === 'HIDDEN' && (
                        <>
                          <button
                            onClick={() => handleProjectAction(proj._id, 'resubmit')}
                            className="px-3 py-1 text-xxs font-bold text-white bg-violet-650 hover:bg-violet-700 rounded-md"
                          >
                            Resubmit
                          </button>
                          <button
                            onClick={() => handleProjectAction(proj._id, 'delete')}
                            className="px-3 py-1 text-xxs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-md"
                          >
                            Delete
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingProjects && projectsList.length > 0 && (
              <Pagination
                page={projectsPage}
                totalPages={projectsPagination.totalPages}
                onPageChange={setProjectsPage}
              />
            )}
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Activity Notifications</h3>
              {notificationsList.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {loadingNotifications ? (
              <div className="space-y-3">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              </div>
            ) : notificationsList.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-2">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationsList.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                      !notif.isRead
                        ? 'bg-violet-50/40 dark:bg-violet-950/20 border-violet-200'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === 'PROJECT_APPROVED' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' :
                      notif.type === 'PROJECT_REJECTED' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' :
                      notif.type === 'PROJECT_LIKED' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400' :
                      notif.type === 'USER_FOLLOWED' ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400' :
                      notif.type === 'PROJECT_HIDDEN' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {getNotificationIcon(notif.type)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className={`text-sm text-gray-850 dark:text-gray-200 leading-relaxed ${!notif.isRead ? 'font-semibold text-gray-900' : ''}`}>
                        {notif.message}
                      </p>
                      <p className="text-xxs text-gray-400 font-semibold">
                        {getRelativeTime(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingNotifications && notificationsList.length > 0 && (
              <Pagination
                page={notificationsPage}
                totalPages={notificationsPagination.totalPages}
                onPageChange={setNotificationsPage}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
