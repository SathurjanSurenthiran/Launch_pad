import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { statsService } from '../../services/stats.service';
import { GoogleLogin } from '@react-oauth/google';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

export default function LoginPage() {
  const { isAuthenticated, isLoading, user, login } = useAuth();
  const navigate = useNavigate();

  const [actionLoading, setActionLoading] = useState(false);
  const [originError, setOriginError] = useState(false);
  const [platformStats, setPlatformStats] = useState({ totalStudents: 0, totalRecruiters: 0, totalProjects: 0 });

  /* ── Fetch platform stats from DB ── */
  useEffect(() => {
    statsService.getPublicStats()
      .then(res => {
        if (res.data?.data) setPlatformStats(res.data.data);
      })
      .catch(() => { /* silently fail — stats are non-critical */ });
  }, []);

  /* ── Redirect if already logged in ── */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'RECRUITER') navigate('/recruiter/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  const processUserData = (userData, toastId) => {
    if (userData) {
      const isNew = userData.createdAt && new Date() - new Date(userData.createdAt) < 10000;
      if (isNew) localStorage.setItem('showWelcomeOverlay', 'true');
      login(userData);
      toast.success(`Welcome, ${userData.name}`, { id: toastId });
    } else {
      toast.error('Authentication failed.', { id: toastId });
    }
  };

  /* ── Google OAuth (ID token credential flow) ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setActionLoading(true);
    const toastId = toast.loading('Authenticating...');
    try {
      const response = await authService.googleLogin(credentialResponse.credential, 'STUDENT');
      processUserData(response.data?.data, toastId);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Google Sign-In failed.', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGoogleError = () => {
    setOriginError(true);
    toast.error('Google Sign-In failed. Ensure the origin is registered in Google Cloud Console.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 py-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 dark:bg-slate-950 p-12 gap-10">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 overflow-hidden rounded-lg flex items-center justify-center shrink-0">
                <img
                  src={logo}
                  alt="LaunchPad"
                  className="w-full h-full object-contain scale-[1.8]"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LaunchPad</span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Where student<br />builders get<br />discovered.
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed font-light">
              Showcase your projects to thousands of recruiters and industry leaders worldwide.
            </p>
          </div>

          <div className="flex items-center gap-5 pt-4 border-t border-slate-800">
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalStudents}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalRecruiters}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recruiters</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-white">{platformStats.totalProjects}</span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Projects</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 tracking-wider">LaunchPad &copy; {new Date().getFullYear()}</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-gray-900">
          <div className="w-full flex flex-col gap-6">

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Sign in</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use your Google account to continue</p>
            </div>

            {/* Origin Error */}
            {originError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 rounded-xl p-4 space-y-1">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Google OAuth: Origin Not Registered</p>
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                  Add <strong>{window.location.origin}</strong> to your Google Cloud Console under
                  APIs &amp; Services &rarr; Credentials &rarr; Authorized JavaScript Origins.
                </p>
              </div>
            )}

            {/* Google Sign-In */}
            <div className="flex flex-col gap-2.5">
              {actionLoading ? (
                <button id="google-signin-btn" disabled className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-200 text-sm font-medium">
                  <Spinner size="sm" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Signing in...</span>
                </button>
              ) : (
                <div id="google-signin-btn" className="flex justify-start">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="outline"
                    shape="rectangular"
                    text="continue_with"
                    width="320"
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              New here? Your account is created automatically on first sign in.
              By continuing you agree to our{' '}
              <span className="text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-700 dark:hover:text-blue-300">Terms of Service</span> and{' '}
              <span className="text-blue-600 dark:text-blue-400 cursor-pointer underline hover:text-blue-700 dark:hover:text-blue-300">Privacy Policy</span>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
