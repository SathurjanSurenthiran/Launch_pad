import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/project.service';
import { interactionService } from '../../services/interaction.service';
import useDebounce from '../../hooks/useDebounce';
import useApi from '../../hooks/useApi';
import ProjectCard from '../../components/ProjectCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import Pagination from '../../components/ui/Pagination';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Search, X } from 'lucide-react';

export default function RecruiterDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'following'

  // Filter States
  const [searchVal, setSearchVal] = useState('');
  const [category, setCategory] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);

  // Followed Students States
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingPage, setFollowingPage] = useState(1);
  const [followingPagination, setFollowingPagination] = useState({ page: 1, totalPages: 1 });

  // Like states tracking
  const [sessionLikesMap, setSessionLikesMap] = useState({});

  const debouncedQuery = useDebounce(searchVal, 450);
  const debouncedTechStack = useDebounce(techStackInput, 450);

  const { data: responseData, loading: loadingProjects, execute: fetchProjects } = useApi(
    debouncedQuery ? projectService.searchProjects : projectService.getProjects
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, category, debouncedTechStack, sortBy]);

  // Fetch approved projects
  const loadProjectsList = useCallback(() => {
    const params = {
      page,
      limit: 9,
      category: category || undefined,
      techStack: debouncedTechStack || undefined,
      sortBy: sortBy || undefined,
      status: 'APPROVED',
    };

    if (debouncedQuery) {
      params.q = debouncedQuery;
    }

    fetchProjects(params);
  }, [debouncedQuery, category, debouncedTechStack, sortBy, page, fetchProjects]);

  // Fetch followed students
  const loadFollowingList = useCallback(async (pageNum) => {
    const myId = user?._id || user?.id || user?.userId;
    if (!myId) return;

    setLoadingFollowing(true);
    try {
      const response = await interactionService.getFollowing(myId, { page: pageNum, limit: 10 });
      const data = response.data?.data;
      setFollowingList(data?.following || []);
      setFollowingPagination(data?.pagination || { page: 1, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load followed students:', error);
    } finally {
      setLoadingFollowing(false);
    }
  }, [user]);

  // Trigger loading based on active tab
  useEffect(() => {
    if (activeTab === 'browse') {
      loadProjectsList();
    } else if (activeTab === 'following') {
      loadFollowingList(followingPage);
    }
  }, [activeTab, loadProjectsList, loadFollowingList, followingPage]);

  // Handle liking a project
  const handleLikeToggle = async (e, projectId, currentLiked) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You must be signed in to like student projects. ❌');
      return;
    }

    const isCurrentlyLiked = sessionLikesMap[projectId] !== undefined ? sessionLikesMap[projectId] : currentLiked;

    try {
      const response = await interactionService.toggleLike(projectId);
      const likedNow = response.data?.data?.liked;

      setSessionLikesMap((prev) => ({
        ...prev,
        [projectId]: likedNow,
      }));

      toast.success(likedNow ? 'Added to your liked projects.' : 'Removed from your liked projects.');
      if (activeTab === 'browse') {
        loadProjectsList();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Could not complete like action.');
    }
  };

  const handleUnfollowStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to unfollow ${studentName || 'this student'}?`)) {
      return;
    }
    try {
      await interactionService.toggleFollow(studentId);
      toast.success(`Unfollowed ${studentName || 'student'}.`);
      loadFollowingList(followingPage);
    } catch (error) {
      console.error('Failed to unfollow student:', error);
      toast.error('Failed to unfollow student.');
    }
  };

  const handleClearFilters = () => {
    setSearchVal('');
    setCategory('');
    setTechStackInput('');
    setSortBy('latest');
    setPage(1);
  };

  const projects = responseData?.data?.projects || [];
  const pagination = responseData?.data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      {/* 1. Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          Talent Discovery
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400">
          Browse and discover student builders
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('browse')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'browse'
              ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Browse Projects
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'following'
              ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Followed Students
        </button>
      </div>

      {/* 3. Tab Views */}
      <div className="space-y-6">
        
        {/* TAB: Browse Projects */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xxs space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="">All Categories</option>
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tech Stack</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    <option value="latest">Latest Submissions</option>
                    <option value="likes">Most Liked</option>
                    <option value="oldest">Oldest Submissions</option>
                  </select>
                </div>
              </div>

              {(searchVal || category || techStackInput || sortBy !== 'latest') && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Grid of Projects */}
            {loadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
                  <Search size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No projects found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light max-w-sm mx-auto">
                  We couldn't find any approved projects matching your filters.
                </p>
                <Button variant="secondary" onClick={handleClearFilters} className="font-bold py-1.5 px-6">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => {
                  const isLikedByRecruiter = sessionLikesMap[proj._id] !== undefined ? sessionLikesMap[proj._id] : proj.isLiked;
                  return (
                    <div key={proj._id} className="relative group">
                      <ProjectCard project={proj} />
                      
                      {/* Recruiter specific interaction row */}
                      <div className="mt-2.5 flex items-center justify-between bg-white dark:bg-gray-805 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xxs">
                        {proj.owner ? (
                          <Link to={`/users/${proj.owner._id || proj.owner.id}`} className="flex items-center space-x-2 shrink min-w-0">
                            <Avatar src={proj.owner.profilePicture} name={proj.owner.name} size="xs" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-violet-600 hover:underline truncate">
                              {proj.owner.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-450">Anonymous</span>
                        )}

                        <button
                          onClick={(e) => handleLikeToggle(e, proj._id, proj.isLiked)}
                          className={`py-1 px-3 text-xxs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                            isLikedByRecruiter
                              ? 'bg-violet-50 dark:bg-violet-950/20 border-violet-250 text-violet-650'
                              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-violet-50/50'
                          }`}
                        >
                          <span>{isLikedByRecruiter ? '❤️' : '🤍'}</span>
                          <span>{isLikedByRecruiter ? 'Liked' : 'Like'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingProjects && projects.length > 0 && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        )}

        {/* TAB: Followed Students */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            {loadingFollowing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              </div>
            ) : followingList.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-md mx-auto p-8 space-y-3">
                <span className="text-4xl block">👤</span>
                <p className="text-sm text-gray-550 dark:text-gray-400 font-light">
                  You are not following any students yet. Browse projects to discover talent.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {followingList.map((followObj) => {
                  const student = followObj.following;
                  if (!student) return null;
                  return (
                    <div key={student._id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-xxs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <Avatar src={student.profilePicture} name={student.name} size="md" />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-950 dark:text-white truncate text-sm">
                            {student.name}
                          </h4>
                          <p className="text-xxs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {student.university || 'Student Builder'} {student.department ? `• ${student.department}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link to={`/users/${student._id}`}>
                          <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-50 text-xxs transition-colors">
                            View Profile
                          </button>
                        </Link>
                        <button
                          onClick={() => handleUnfollowStudent(student._id, student.name)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-lg text-xxs transition-colors"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingFollowing && followingList.length > 0 && (
              <Pagination
                page={followingPage}
                totalPages={followingPagination.totalPages}
                onPageChange={setFollowingPage}
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
