import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from '../components/ui/Avatar';
import logo from '../assets/logo.png';

/* ── SVG icons (no emojis) ── */
function IconGrid() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconSite() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <IconGrid /> },
    { name: 'Users',     path: '/admin/users',     icon: <IconUsers /> },
    { name: 'Projects',  path: '/admin/projects',  icon: <IconFolder /> },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('users'))     return 'User Accounts';
    if (path.includes('projects'))  return 'Project Submissions';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="w-11 h-11 overflow-hidden rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src={logo}
                alt="LaunchPad"
                className="w-full h-full object-contain scale-[1.8]"
              />
            </div>
            <span className="text-base font-bold">LaunchPad</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav label */}
        <div className="px-6 pt-5 pb-2">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Admin Panel
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}

          {/* View Site — same style as nav items */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <span className="text-gray-400 dark:text-gray-500">
              <IconSite />
            </span>
            View Site
          </Link>
        </nav>

        {/* Admin profile section at bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Avatar src={user?.profilePicture} name={user?.name || 'Admin'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase mb-0.5">Admin</p>
            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white leading-tight">{user?.name || 'Administrator'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-800 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Avatar src={user?.profilePicture} name={user?.name || 'Admin'} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-gray-400 leading-tight">{user?.email || 'admin'}</p>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-grow p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
