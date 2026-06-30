import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xs border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-full">
      {/* Cover Image Placeholder */}
      <div className="bg-gray-200 dark:bg-gray-700 h-48 w-full" />

      {/* Content Placholder */}
      <div className="p-5 flex-1 flex flex-col space-y-3">
        {/* Category Pill Placeholder */}
        <div className="bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded-md" />

        {/* Title Placeholder */}
        <div className="bg-gray-200 dark:bg-gray-700 h-6 w-3/4 rounded-md" />

        {/* Description Placeholders */}
        <div className="space-y-2 flex-1">
          <div className="bg-gray-200 dark:bg-gray-700 h-3.5 w-full rounded-md" />
          <div className="bg-gray-200 dark:bg-gray-700 h-3.5 w-5/6 rounded-md" />
        </div>

        {/* Tech Stack Chips Placeholder */}
        <div className="flex gap-2 pt-2">
          <div className="bg-gray-200 dark:bg-gray-700 h-5 w-12 rounded-full" />
          <div className="bg-gray-200 dark:bg-gray-700 h-5 w-16 rounded-full" />
          <div className="bg-gray-200 dark:bg-gray-700 h-5 w-14 rounded-full" />
        </div>

        {/* Footer Placeholder */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-8 w-8" />
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md" />
          </div>
          <div className="flex space-x-3">
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-8 rounded-md" />
            <div className="bg-gray-200 dark:bg-gray-700 h-4 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
