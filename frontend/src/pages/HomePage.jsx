import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/project.service';
import { statsService } from '../services/stats.service';
import useApi from '../hooks/useApi';
import ProjectCard from '../components/ProjectCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Heart, Eye, ArrowRight } from 'lucide-react';

const MOCK_FEATURED_PROJECTS = [
  {
    _id: 'mock-1',
    title: 'DeFi Swap Protocol',
    description: 'A decentralized exchange aggregator allowing zero-slippage trades across multiple blockchain liquidity pools with real-time analytics and smart order routing.',
    coverImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=60',
    category: 'BLOCKCHAIN',
    techStack: ['React', 'Solidity', 'TailwindCSS', 'Web3.js'],
    likeCount: 142,
    viewCount: 1042,
    owner: {
      name: 'Sarah Chen',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60'
    }
  },
  {
    _id: 'mock-2',
    title: 'MedAI Diagnostics',
    description: 'An AI-powered chest X-ray classifier trained on 100k+ clinical images to detect lung pathologies including pneumonia and COVID-19 with 94.5% precision.',
    coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=800&auto=format&fit=crop&q=60',
    category: 'ARTIFICIAL INTELLIGENCE',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'React'],
    likeCount: 205,
    viewCount: 1530,
    owner: {
      name: 'Alex Rivera',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60'
    }
  },
  {
    _id: 'mock-3',
    title: 'EcoSphere IoT Tracker',
    description: 'A solar-powered IoT hardware node and dashboard telemetry system to track soil pH, moisture levels, and temperature metrics for precision agriculture.',
    coverImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop&q=60',
    category: 'INTERNET OF THINGS',
    techStack: ['C++', 'ESP32', 'Node.js', 'Grafana'],
    likeCount: 98,
    viewCount: 689,
    owner: {
      name: 'Liam Sterling',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60'
    }
  }
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Welcome Screen Overlay State
  const [showWelcome, setShowWelcome] = useState(false);

  // Slideshow States
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

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

  // Combine API projects with mock projects for slideshow
  const featuredSlides = projects.length > 0 ? projects.slice(0, 5) : MOCK_FEATURED_PROJECTS;

  // Autoplay Slideshow rotation
  useEffect(() => {
    if (!autoplay || featuredSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay, featuredSlides.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % featuredSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
  };

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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 relative transition-colors duration-200">
      
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
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-colors text-sm shadow-xs focus:outline-none"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-hidden relative">
        {/* Glow decorative backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-300/10 dark:bg-violet-500/5 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline and actions */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="space-y-5">
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 dark:text-white tracking-tight leading-[1.08] lg:leading-[1.12]">
                Discover What Students Are <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">Building</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Browse real, student-built apps, explore detailed technical stacks, and connect with the next generation of engineers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
              <button
                onClick={() => navigate('/projects')}
                className="group w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] text-sm shadow-lg shadow-violet-550/20 hover:shadow-xl hover:shadow-violet-500/30"
              >
                <span>Browse Projects</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3.5 border border-gray-250 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-850 bg-white/50 dark:bg-gray-800/40 text-gray-750 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic Slider */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center w-full max-w-xl mx-auto lg:max-w-none">
            {/* Slideshow Card */}
            <div 
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
              className="relative w-full h-[410px] rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-gray-750 bg-white dark:bg-gray-900 flex flex-col group transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-850"
            >
              {/* Slides Container */}
              <div className="relative flex-1 overflow-hidden w-full h-full">
                {featuredSlides.map((slide, index) => {
                  const isActive = index === activeSlide;
                  return (
                    <div
                      key={slide._id}
                      onClick={() => navigate(`/projects/${slide._id}`)}
                      className={`absolute inset-0 w-full h-full flex flex-col cursor-pointer transition-all duration-700 ease-in-out ${
                        isActive 
                          ? 'opacity-100 translate-x-0 pointer-events-auto z-10' 
                          : 'opacity-0 translate-x-8 pointer-events-none z-0'
                      }`}
                    >
                      {/* Cover Image */}
                      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-850 overflow-hidden">
                        <img
                          src={slide.coverImage}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-violet-600 text-white tracking-wider uppercase shadow-sm">
                            {slide.category}
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-lg font-bold tracking-tight line-clamp-1 group-hover:text-violet-200 transition-colors">
                            {slide.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between bg-white dark:bg-gray-900">
                        <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-3 leading-relaxed font-light">
                          {slide.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {slide.techStack.slice(0, 4).map((tech, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent dark:border-gray-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Owner & Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <img
                              src={slide.owner?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60'}
                              alt={slide.owner?.name}
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                              {slide.owner?.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1 text-rose-500/80">
                              <Heart size={13} className="fill-rose-500 stroke-rose-500 text-rose-500" />
                              {slide.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={13} />
                              {slide.viewCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Prev / Next controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 shadow-md border border-gray-150 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white dark:hover:text-white z-20"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 shadow-md border border-gray-150 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white dark:hover:text-white z-20"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xxs border border-gray-100 dark:border-gray-800">
                {featuredSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide 
                        ? 'w-4 bg-violet-600 dark:bg-violet-400' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-750 py-6 px-4 text-center shadow-xs hover:shadow-md hover:border-violet-250 dark:hover:border-violet-900/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
              {platformStats.totalProjects}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1.5">
              Projects Submitted
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-750 py-6 px-4 text-center shadow-xs hover:shadow-md hover:border-violet-250 dark:hover:border-violet-900/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
              {platformStats.totalStudents}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1.5">
              Student Builders
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-750 py-6 px-4 text-center shadow-xs hover:shadow-md hover:border-violet-250 dark:hover:border-violet-900/40 hover:-translate-y-0.5 transition-all duration-300 group">
            <h3 className="text-3xl font-black text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
              {platformStats.totalRecruiters}
            </h3>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1.5">
              Recruiters Browsing
            </p>
          </div>
        </div>
      </section>

      {/* 4. Latest Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
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
