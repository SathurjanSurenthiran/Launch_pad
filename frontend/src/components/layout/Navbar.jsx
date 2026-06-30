import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { notificationService } from '../../services/notification.service';
import Avatar from '../ui/Avatar';
import logo from '../../assets/logo.png';
import { Sun, Moon, Bell, Menu, X, LogOut, User } from 'lucide-react';

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
    navigate('/');
  };

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/40 dark:border-gray-800/40 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left section: Logo and Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-9 h-9 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={logo}
                  alt="LaunchPad"
                  className="w-full h-full object-contain scale-[1.8]"
                />
              </div>
              <span className="text-base font-bold text-gray-950 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                LaunchPad
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1.5">
               {/* Not Logged In or Logged In as STUDENT */}
              {(!isAuthenticated || user?.role === 'STUDENT') && (
                <NavLink
                  to="/projects"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
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
                    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
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
                    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
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
                      `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
                      }`
                    }
                  >
                    Users
                  </NavLink>
                  <NavLink
                    to="/admin/projects"
                    className={({ isActive }) =>
                      `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-violet-50/60 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/40'
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
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell (Only for STUDENT and RECRUITER) */}
                {user?.role !== 'ADMIN' && (
                  <Link
                    to="/notifications"
                    className="relative p-2 text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <span className="sr-only">Notifications</span>
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-violet-600 text-white rounded-full text-[9px] font-black h-3.5 w-3.5 flex items-center justify-center shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Profile Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/30 hover:scale-102 transition-transform"
                  >
                    <Avatar src={user?.profilePicture} name={user?.name || 'User'} size="sm" />
                  </button>

                  {isDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-150 dark:border-gray-800/80 p-2 focus:outline-none divide-y divide-gray-100 dark:divide-gray-800/50 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                      <div className="px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500">
                        Signed in as <p className="font-bold text-gray-900 dark:text-white truncate mt-0.5">{user?.name}</p>
                      </div>
                      
                      <div className="py-1">
                        {user?.role !== 'ADMIN' && (
                          <Link
                            to="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-all font-semibold"
                          >
                            <User size={14} className="text-gray-450 dark:text-gray-450" />
                            My Profile
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold rounded-xl transition-all"
                        >
                          <LogOut size={14} />
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
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-750 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-555 hover:text-gray-950 dark:text-gray-450 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-150/40 dark:border-gray-800/40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-in slide-in-from-top duration-250">
          <div className="pt-2 pb-3 space-y-1.5 px-4">
             {(!isAuthenticated || user?.role === 'STUDENT') && (
              <Link
                to="/projects"
                className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                Projects
              </Link>
            )}
            {isAuthenticated && user?.role === 'STUDENT' && (
              <Link
                to="/projects/new"
                className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                Submit Project
              </Link>
            )}
            {isAuthenticated && user?.role === 'RECRUITER' && (
              <Link
                to="/recruiter/dashboard"
                className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                >
                  Users
                </Link>
                <Link
                  to="/admin/projects"
                  className="block px-4 py-2.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                >
                  Projects
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 pb-4 border-t border-gray-150/40 dark:border-gray-800/40 px-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3 py-1">
                  <Avatar src={user?.profilePicture} name={user?.name || 'User'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  {user?.role !== 'ADMIN' && (
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-semibold text-gray-600 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                  )}
                  {user?.role !== 'ADMIN' && (
                    <Link
                      to="/notifications"
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-semibold text-gray-600 dark:text-gray-250 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell size={15} />
                        <span>Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-black text-white bg-violet-650 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-base font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold text-white bg-violet-600 hover:bg-violet-750 shadow-sm transition-all"
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
