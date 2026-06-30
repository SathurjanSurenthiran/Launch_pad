import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function RoleSelectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8 text-center space-y-6 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

        <div className="space-y-2">
          <span className="text-4xl">🎉</span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome, {user?.name || 'Builder'}!
          </h2>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            You are joining as a Student
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
          LaunchPad is a dedicated portal for students to showcase projects and get discovered by recruiters. Complete your profile and showcase your accomplishments.
        </p>

        <Button
          variant="primary"
          onClick={() => navigate('/', { replace: true })}
          className="w-full py-2.5 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform text-sm"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
