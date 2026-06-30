import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notification.service';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';

/* ── SVG type icons ────────────────────────────────────────────────── */
function IconCheck() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
function IconHidden() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661z" />
    </svg>
  );
}

/* ── Icon + colour per notification type ───────────────────────────── */
const TYPE_META = {
  PROJECT_CREATED:  { icon: <IconFile />,   bg: 'bg-blue-50 dark:bg-blue-950/30',   color: 'text-blue-600 dark:text-blue-400' },
  PROJECT_UPDATED:  { icon: <IconFile />,   bg: 'bg-blue-50 dark:bg-blue-950/30',   color: 'text-blue-600 dark:text-blue-400' },
  PROJECT_APPROVED: { icon: <IconCheck />,  bg: 'bg-green-50 dark:bg-green-950/30', color: 'text-green-600 dark:text-green-400' },
  PROJECT_REJECTED: { icon: <IconX />,      bg: 'bg-red-50 dark:bg-red-950/30',     color: 'text-red-600 dark:text-red-400' },
  PROJECT_HIDDEN:   { icon: <IconHidden />, bg: 'bg-yellow-50 dark:bg-yellow-950/30', color: 'text-yellow-600 dark:text-yellow-400' },
  PROJECT_LIKED:    { icon: <IconHeart />,  bg: 'bg-rose-50 dark:bg-rose-950/30',   color: 'text-rose-500 dark:text-rose-400' },
  USER_FOLLOWED:    { icon: <IconUser />,   bg: 'bg-violet-50 dark:bg-violet-950/30', color: 'text-violet-600 dark:text-violet-400' },
  DEFAULT:          { icon: <IconBell />,   bg: 'bg-gray-100 dark:bg-gray-700',      color: 'text-gray-500 dark:text-gray-400' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotificationsData = useCallback(async (pageNum) => {
    setLoading(true);
    try {
      const notifResponse = await notificationService.getNotifications({ page: pageNum, limit: 15 });
      setNotifications(notifResponse.data?.data?.notifications || []);
      setPagination(notifResponse.data?.data?.pagination || { page: 1, totalPages: 1 });

      const countResponse = await notificationService.getUnreadCount();
      setUnreadCount(countResponse.data?.data?.count || 0);
    } catch (error) {
      console.error('Failed to load notifications data:', error);
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificationsData(page);
  }, [page, fetchNotificationsData]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      toast.success('All notifications marked as read.');
      setUnreadCount(0);
      fetchNotificationsData(page);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to complete action.');
    }
  };

  const handleNotificationClick = async (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.isRead) {
      try {
        await notificationService.markOneRead(notifId);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(item => ((item._id === notifId || item.id === notifId) ? { ...item, isRead: true } : item))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    const refId = notif.referenceId;
    if (notif.type === 'USER_FOLLOWED') {
      const senderId = notif.sender?._id || notif.sender?.id || refId;
      if (senderId) navigate(`/users/${senderId}`);
    } else if (notif.type.startsWith('PROJECT_')) {
      if (refId) navigate(`/projects/${refId}`);
    }
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    if (diffMs < 0) return 'just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMeta = (type) => TYPE_META[type] || TYPE_META.DEFAULT;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 min-h-screen">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All notifications are read'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="md" />
        </div>

      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
            <IconInbox />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            No notifications yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            You will be notified when someone likes your project, follows you, or your submission is reviewed.
          </p>
        </div>

      ) : (
        /* Notification List */
        <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {notifications.map((notif) => {
            const notifId = notif._id || notif.id;
            const meta = getMeta(notif.type);
            return (
              <div
                key={notifId}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors
                  ${!notif.isRead
                    ? 'bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {/* Type icon badge */}
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed text-gray-800 dark:text-gray-200 ${!notif.isRead ? 'font-medium' : 'font-normal'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {getRelativeTime(notif.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="mt-2 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && notifications.length > 0 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
