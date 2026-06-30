import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setResetData(null);
    const toastId = toast.loading('Sending reset request...');
    try {
      const response = await authService.forgotPassword(email);
      const data = response.data?.data;
      setResetData(data);
      toast.success('Reset link generated successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'No account found with this email.';
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
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Forgot Password</h2>
          <p className="text-sm text-gray-550 dark:text-gray-400">Enter your email to reset your password</p>
        </div>

        {resetData ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-xl space-y-2 text-xs text-indigo-700 dark:text-indigo-355">
              <p className="font-bold">✅ Reset Link Generated Successfully</p>
              <p className="leading-relaxed">
                Since this is local developer testing, the reset link is displayed below:
              </p>
              <a
                href={resetData.resetLink}
                className="block font-bold underline break-all mt-1 hover:text-indigo-805 dark:hover:text-indigo-300"
              >
                {resetData.resetLink}
              </a>
            </div>
            <Link to="/login" className="block">
              <Button variant="secondary" className="w-full py-2.5 font-bold">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-650 dark:text-red-400 font-semibold mt-1">
                ⚠️ {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm"
              disabled={loading}
            >
              {loading ? 'Generating link...' : 'Reset Password'}
            </Button>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Remember your credentials?{' '}
              <Link to="/login" className="text-indigo-650 dark:text-indigo-400 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
