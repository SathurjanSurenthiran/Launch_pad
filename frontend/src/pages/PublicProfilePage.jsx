import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { interactionService } from '../services/interaction.service';
import ProjectCard from '../components/ProjectCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Search, FolderOpen } from 'lucide-react';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState(1);
  const [projectsData, setProjectsData] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await userService.getUserById(id);
      setProfile(response.data?.data || null);
    } catch (error) {
      console.error('Failed to retrieve user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [id]);

  const fetchProjectsData = useCallback(async (pageNum) => {
    setProjectsLoading(true);
    try {
      const response = await userService.getUserProjects(id, { page: pageNum, limit: 12 });
      setProjectsData(response.data?.data || null);
    } catch (error) {
      console.error('Failed to retrieve user projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchProfileData();
    setPage(1);
    fetchProjectsData(1);
  }, [id, fetchProfileData, fetchProjectsData]);

  // Page change
  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    fetchProjectsData(pageNum);
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await interactionService.toggleFollow(id);
      const isFollowingNow = response.data?.data?.following;

      setProfile((prev) => {
        if (!prev) return prev;
        const currentFollowers = prev.followStats?.followersCount || 0;
        return {
          ...prev,
          isFollowing: isFollowingNow,
          followStats: {
            ...prev.followStats,
            followersCount: isFollowingNow ? currentFollowers + 1 : Math.max(0, currentFollowers - 1),
          },
        };
      });
    } catch (error) {
      console.error('Failed to toggle follow status:', error);
    }
  };

  const isOwnProfile = user && (user._id === id || user.id === id || user.userId === id);
  const projects = projectsData?.projects || [];
  const pagination = projectsData?.pagination || { page: 1, totalPages: 1 };

  if (profileLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="bg-white dark:bg-gray-800 h-60 rounded-3xl border border-gray-100 dark:border-gray-700" />
        <div className="bg-white dark:bg-gray-800 h-96 rounded-3xl border border-gray-100 dark:border-gray-700" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
          <Search size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile not found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          We couldn't find the user profile you are looking for. It may have been deactivated or never existed.
        </p>
        <Link to="/" className="text-indigo-650 hover:underline font-bold text-sm block">
          Back to Home Page
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Header Card */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xs overflow-hidden">
        {/* Banner decorative background */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800" />

        {/* Profile Details area */}
        <div className="px-6 sm:px-8 pb-8 relative">

          {/* Avatar overlay */}
          <div className="absolute -top-16 left-6 sm:left-8">
            <div className="rounded-full ring-4 ring-white dark:ring-gray-800 overflow-hidden shadow-md">
              <Avatar src={profile.profilePicture} name={profile.name} size="lg" className="w-24 h-24 sm:w-28 sm:h-28 text-2xl" />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-4 min-h-[50px]">
            {isAuthenticated && user?.role === 'RECRUITER' && (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xxs focus:outline-none ${
                  profile.isFollowing
                    ? 'bg-violet-600 hover:bg-violet-755 text-white'
                    : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                }`}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* User Bio Details */}
          <div className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge color={profile.role === 'ADMIN' ? 'red' : profile.role === 'RECRUITER' ? 'green' : 'indigo'}>
                  {profile.role}
                </Badge>
                {profile.isVerified && (
                  <span className="text-blue-500 font-semibold text-xs inline-flex items-center gap-0.5">
                    Verified Builder ✔
                  </span>
                )}
              </div>
            </div>

            {/* University & Department */}
            {(profile.university || profile.department) && (
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{profile.university}</span>
                {profile.university && profile.department && <span>&bull;</span>}
                <span>{profile.department}</span>
                {profile.graduationYear && (
                  <>
                    <span>&bull;</span>
                    <span>Class of {profile.graduationYear}</span>
                  </>
                )}
              </div>
            )}

            {/* Bio */}
            {profile.bio ? (
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-gray-450 dark:text-gray-400 italic font-light">
                No bio written yet.
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-6 pt-2 border-t border-gray-100 dark:border-gray-700">
              {profile.role === 'STUDENT' && (
                <>
                  <div className="text-center sm:text-left">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {profile.followStats?.followersCount || 0}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Followers
                    </span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {profile.projectCount || 0}
                    </span>
                    <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Projects
                    </span>
                  </div>
                </>
              )}

              {profile.role === 'RECRUITER' && (
                <div className="text-center sm:text-left">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.followStats?.followingCount || 0}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Following
                  </span>
                </div>
              )}

              {profile.role === 'ADMIN' && (
                <div className="text-center sm:text-left">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.projectCount || 0}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Projects
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Projects list */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Projects by {profile.name}
        </h2>

        {projectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
              <FolderOpen size={26} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No projects shown</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This user hasn't uploaded any showcase projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

        {/* Paginated profile projects */}
        {!projectsLoading && projects.length > 0 && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </div>
  );
}
