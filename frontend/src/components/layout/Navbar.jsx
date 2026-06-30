import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notification.service';
import Avatar from '../ui/Avatar';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus when location changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notification count (only for STUDENT and RECRUITER)
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'ADMIN') {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(response.data?.data?.count || 0);
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 45000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left section: Logo and Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-12 h-12 overflow-hidden rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src={logo}
                  alt="LaunchPad"
                  className="w-full h-full object-contain scale-[1.8]"
                />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                LaunchPad
              </span>
            </Link>

            {/* Desktop Center Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
               {/* Not Logged In or Logged In as STUDENT */}
              {(!isAuthenticated || user?.role === 'STUDENT') && (
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  Projects
                </NavLink>
              )}

              {isAuthenticated && user?.role === 'STUDENT' && (
                <NavLink
                  to="/projects/new"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  Submit Project
                </NavLink>
              )}

              {/* Logged in as RECRUITER */}
              {isAuthenticated && user?.role === 'RECRUITER' && (
                <NavLink
                  to="/recruiter/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {/* Logged in as ADMIN */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    Users
                  </NavLink>
                  <NavLink
                    to="/admin/projects"
                    className={({ isActive }) =>
                      `px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-700 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    Projects
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Right section: Authentication and User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell (Only for STUDENT and RECRUITER) */}
                {user?.role !== 'ADMIN' && (
                  <Link
                    to="/notifications"
                    className="relative p-2 text-gray-500 hover:text-violet-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="sr-only">Notifications</span>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[10px] font-bold h-4 w-4 flex items-center justify-center border-2 border-white dark:border-gray-800">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? (
                    // Sun icon — shown in dark mode to switch to light
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    // Moon icon — shown in light mode to switch to dark
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <Avatar src={user?.profilePicture} name={user?.name || 'User'} size="sm" />
                  </button>

                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10 py-1.5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                        Signed in as <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                      </div>
                      
                      <div className="py-1">
                        {user?.role !== 'ADMIN' && (
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            My Profile
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Theme Toggle (logged out) */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-violet-600 hover:bg-violet-750 shadow-sm transition-all focus:outline-none"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Trigger */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 animate-in slide-in-from-top duration-200">
          <div className="pt-2 pb-3 space-y-1 px-4">
             {(!isAuthenticated || user?.role === 'STUDENT') && (
              <Link
                to="/projects"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Projects
              </Link>
            )}
            {isAuthenticated && user?.role === 'STUDENT' && (
              <Link
                to="/projects/new"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Submit Project
              </Link>
            )}
            {isAuthenticated && user?.role === 'RECRUITER' && (
              <Link
                to="/recruiter/dashboard"
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Users
                </Link>
                <Link
                  to="/admin/projects"
                  className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Projects
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-700 px-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-3 py-1">
                  <Avatar src={user?.profilePicture} name={user?.name || 'User'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-905 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {user?.role !== 'ADMIN' && (
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      My Profile
                    </Link>
                  )}
                  {user?.role !== 'ADMIN' && (
                    <Link
                      to="/notifications"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-lg text-base font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 border border-transparent rounded-lg text-base font-bold text-white bg-violet-600 hover:bg-violet-750 shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
