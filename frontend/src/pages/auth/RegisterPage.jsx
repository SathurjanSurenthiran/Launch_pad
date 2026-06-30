import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // STUDENT or RECRUITER
  const [university, setUniversity] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (role === 'RECRUITER') {
      const isOrgEmail = email.endsWith('@faculty.edu') || email.endsWith('@staff.com');
      if (!isOrgEmail) {
        setErrorMsg('Recruiter accounts must use an official email ending in @faculty.edu or @staff.com');
        return;
      }
    }

    setActionLoading(true);
    setErrorMsg('');
    const toastId = toast.loading('Registering account...');
    try {
      const response = await authService.register({
        name,
        email,
        password,
        role,
        university: role === 'STUDENT' ? university : undefined,
      });

      const userData = response.data?.data;
      if (userData) {
        login(userData);
        toast.success(`Account created! Welcome, ${userData.name}!`, { id: toastId });
        navigate('/', { replace: true });
      } else {
        toast.error('Registration failed.', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Email is already registered or registration failed.';
      setErrorMsg(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8 space-y-6 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Join LaunchPad as a Student or Recruiter</p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-xs transition-all ${
              role === 'STUDENT'
                ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('RECRUITER');
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-2 rounded-lg font-bold text-xs transition-all ${
              role === 'RECRUITER'
                ? 'bg-white dark:bg-gray-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            👥 Recruiter
          </button>
        </div>

        {role === 'RECRUITER' && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-lg text-xs text-amber-700 dark:text-amber-300">
            ⚠️ Recruiter signup requires an official email ending with <strong>@faculty.edu</strong> or <strong>@staff.com</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'RECRUITER' ? 'name@staff.com' : 'student@university.edu'}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          {role === 'STUDENT' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Faculty of Computing"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-650 dark:text-red-400 font-bold mt-1">
              ⚠️ {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm mt-3"
            disabled={actionLoading}
          >
            {actionLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
