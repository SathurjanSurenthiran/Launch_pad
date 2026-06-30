import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const toastId = toast.loading('Updating password...');
    try {
      await authService.resetPassword(token, password);
      toast.success('Password updated successfully! Please sign in.', { id: toastId });
      navigate('/login');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to reset password. Link may be expired.';
      setErrorMsg(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8 space-y-6 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-550 dark:text-gray-400">Enter a secure new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-655 dark:text-red-400 font-semibold mt-1">
              ⚠️ {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm"
            disabled={loading}
          >
            {loading ? 'Saving password...' : 'Save New Password'}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Cancel and{' '}
            <Link to="/login" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
              Return to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
