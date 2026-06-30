import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../services/project.service';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import ProjectCard from '../components/ProjectCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Pagination from '../components/ui/Pagination';
import Button from '../components/ui/Button';
import { PROJECT_CATEGORIES } from '../utils/constants';
import { Search, X } from 'lucide-react';

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [techStackInput, setTechStackInput] = useState(searchParams.get('techStack') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'latest');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(searchVal, 450);
  const debouncedTechStack = useDebounce(techStackInput, 450);

  const { data: responseData, loading, execute: fetchProjects } = useApi(projectService.getProjects);

  // Synchronize with URL params
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || '';
    const techParam = searchParams.get('techStack') || '';
    const sortParam = searchParams.get('sortBy') || 'latest';

    setSearchVal(qParam);
    setCategory(catParam);
    setTechStackInput(techParam);
    setSortBy(sortParam);
  }, [searchParams]);

  // Fetch projects when state variables change
  useEffect(() => {
    const params = {
      page,
      limit: 9, // grid layout fits 9 well
      category: category || undefined,
      techStack: debouncedTechStack || undefined,
      sortBy: sortBy || undefined,
      q: debouncedQuery || undefined,
    };

    fetchProjects(params);
  }, [debouncedQuery, category, debouncedTechStack, sortBy, page, fetchProjects]);

  // Update URL parameters helper
  const updateParams = (newParams) => {
    const updated = {
      q: searchVal || undefined,
      category: category || undefined,
      techStack: techStackInput || undefined,
      sortBy: sortBy || undefined,
      ...newParams,
    };

    // Clean undefined/empty keys
    Object.keys(updated).forEach((key) => {
      if (updated[key] === undefined || updated[key] === '') {
        delete updated[key];
      }
    });

    setSearchParams(updated);
    setPage(1); // Reset page on filter changes
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    updateParams({ q: val });
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    updateParams({ category: val });
  };

  const handleTechChange = (e) => {
    const val = e.target.value;
    setTechStackInput(val);
    updateParams({ techStack: val });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    updateParams({ sortBy: val });
  };

  const handleClearFilters = () => {
    setSearchVal('');
    setCategory('');
    setTechStackInput('');
    setSortBy('latest');
    setSearchParams({});
    setPage(1);
  };

  const projects = responseData?.data?.projects || [];
  const pagination = responseData?.data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Student Projects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Browse projects from the next generation of developers
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
        {/* Search bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
          />
        </div>

        {/* Dropdowns & Tags input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
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
              placeholder="e.g. React, Node, Docker"
              value={techStackInput}
              onChange={handleTechChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <option value="latest">Latest Submissions</option>
              <option value="likes">Most Liked</option>
              <option value="oldest">Oldest Submissions</option>
            </select>
          </div>
        </div>

        {/* Clear filters row */}
        {(searchVal || category || techStackInput || sortBy !== 'latest') && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-violet-655 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg mx-auto p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mx-auto">
            <Search size={28} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No projects found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
            Try adjusting your search query or clearing active filters.
          </p>
          <Button
            variant="secondary"
            onClick={handleClearFilters}
            className="font-bold py-2 px-6 hover:bg-gray-50 text-gray-700 border-gray-300 dark:border-gray-700"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && projects.length > 0 && (
        <div className="pt-8">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
