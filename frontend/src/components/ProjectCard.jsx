import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Eye } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!project) return null;

  const {
    _id,
    title,
    description,
    coverImage,
    category,
    techStack = [],
    likeCount = 0,
    viewCount = 0,
    owner,
    status,
  } = project;
  const currentUserId = user?._id || user?.id || user?.userId;
  const isOwner = currentUserId && owner && (owner._id === currentUserId || owner.id === currentUserId || owner === currentUserId);
  const isAdmin = user?.role === 'ADMIN';
  const showStatusBadge = isOwner || isAdmin;

  const getStatusColor = (stat) => {
    switch (stat) {
      case 'APPROVED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': return 'red';
      case 'HIDDEN': return 'gray';
      default: return 'gray';
    }
  };

  const handleCardClick = () => {
    navigate(`/projects/${_id}`);
  };

  const handleOwnerClick = (e) => {
    // Prevent navigating to the project details page
    e.stopPropagation();
  };

  // Safe category color mapper
  const getCategoryColor = (cat) => {
    if (!cat) return 'gray';
    const normalized = cat.toUpperCase();
    if (normalized.includes('WEB')) return 'blue';
    if (normalized.includes('MOBILE')) return 'green';
    if (normalized.includes('ARTIFICIAL') || normalized.includes('MACHINE')) return 'purple';
    if (normalized.includes('CYBER') || normalized.includes('SECURITY')) return 'red';
    if (normalized.includes('IOT') || normalized.includes('INTERNET')) return 'orange';
    if (normalized.includes('CLOUD')) return 'indigo';
    if (normalized.includes('GAME')) return 'yellow';
    return 'gray';
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xs hover:shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:border-violet-200 dark:hover:border-violet-900 transition-all duration-300 flex flex-col h-full"
    >
      {/* Cover Image & Category Overlay */}
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-400 dark:text-gray-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category absolute badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge color={getCategoryColor(category)} className="backdrop-blur-md bg-opacity-80 shadow-sm">
            {category || 'OTHER'}
          </Badge>
        </div>

        {/* Status absolute badge */}
        {showStatusBadge && status && (
          <div className="absolute top-3 right-3 z-10">
            <Badge color={getStatusColor(status)} className="backdrop-blur-md bg-opacity-80 shadow-sm uppercase">
              {status}
            </Badge>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 h-10 overflow-hidden leading-relaxed">
            {description}
          </p>

          {/* Tech Stack Chips (show first 3, then +N) */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {techStack.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 border border-transparent dark:border-gray-600"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-violet-50 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 border dark:border-violet-700/50">
                +{techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Owner & Stats */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Owner details */}
          {owner ? (
            <Link
              to={`/users/${owner._id || owner.id}`}
              onClick={handleOwnerClick}
              className="flex items-center space-x-2 min-w-0"
            >
              <Avatar src={owner.profilePicture} name={owner.name} size="sm" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate max-w-[120px]">
                {owner.name}
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800" />
              <span className="text-sm text-gray-400">Unknown Author</span>
            </div>
          )}

          {/* Interaction Counts */}
          <div className="flex items-center space-x-3 text-xs font-semibold shrink-0">
            <span className="flex items-center gap-1 text-rose-400 dark:text-rose-400">
              <Heart size={13} className="fill-rose-400 stroke-rose-400" />
              {likeCount}
            </span>
            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-400">
              <Eye size={13} />
              {viewCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
