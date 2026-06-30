import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/project.service';
import { statsService } from '../services/stats.service';
import useApi from '../hooks/useApi';
import ProjectCard from '../components/ProjectCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Welcome Screen Overlay State
  const [showWelcome, setShowWelcome] = useState(false);

  // Api Hook for projects
  const { data: responseData, loading, execute: fetchRecentProjects } = useApi(projectService.getProjects);

  useEffect(() => {
    fetchRecentProjects({ limit: 6, status: 'APPROVED' });
  }, [fetchRecentProjects]);

  useEffect(() => {
    const isNew = localStorage.getItem('showWelcomeOverlay') === 'true';
    if (isNew && isAuthenticated && user) {
      setShowWelcome(true);
    }
  }, [isAuthenticated, user]);

  const handleCloseWelcome = () => {
    localStorage.removeItem('showWelcomeOverlay');
    setShowWelcome(false);
  };

  const projects = responseData?.data?.projects || [];

  const [platformStats, setPlatformStats] = useState({ totalStudents: 0, totalRecruiters: 0, totalProjects: 0 });

  useEffect(() => {
    statsService.getPublicStats()
      .then(res => {
        if (res.data?.data) setPlatformStats(res.data.data);
      })
      .catch(() => { /* silently fail */ });
  }, []);

  // Extract first name for welcome screen
  const getFirstName = () => {
    if (!user?.name) return 'Student';
    return user.name.split(' ')[0];
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 relative">
      
      {/* 1. Welcome Overlay Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in duration-200">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xxs">
                <img
                  src={user?.profilePicture || ''}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Welcome to LaunchPad, {getFirstName()}!
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Your student account is ready. Start by exploring projects or creating your first one.
              </p>
            </div>

            <button
              onClick={handleCloseWelcome}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm shadow-xs focus:outline-none"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-16 sm:py-20 px-6 sm:px-12 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-none">
            Discover What Students Are Building
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
            Browse real projects from the next generation of developers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => navigate('/projects')}
            className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors text-sm shadow-xs"
          >
            Browse Projects
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </section>

      {/* 3. Stats Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-6 px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
          <div className="py-2 md:py-0">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {platformStats.totalProjects}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
              Projects Submitted
            </p>
          </div>
          <div className="py-2 md:py-0">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {platformStats.totalStudents}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
              Student Builders
            </p>
          </div>
          <div className="py-2 md:py-0">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400">
              {platformStats.totalRecruiters}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1">
              Recruiters Browsing
            </p>
          </div>
        </div>
      </section>

      {/* 4. Latest Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
            Latest Projects
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 text-sm">No approved projects shown yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/projects')}
                className="px-6 py-2 border border-gray-300 dark:border-violet-500 bg-white dark:bg-transparent text-gray-700 dark:text-violet-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-violet-500/10 transition-colors text-sm"
              >
                View All Projects
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
