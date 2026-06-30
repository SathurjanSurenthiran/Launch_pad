import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { statsService } from '../../services/stats.service';
import { GoogleLogin } from '@react-oauth/google';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

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
      <div style={styles.loadingWrap}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>
          <div style={styles.leftTop}>
            <div style={styles.brand}>
              <div style={styles.brandMark}>LP</div>
              <span style={styles.brandName}>LaunchPad</span>
            </div>

            <h2 style={styles.heroHeading}>
              Where student<br />builders get<br />discovered.
            </h2>
            <p style={styles.heroSub}>
              Showcase your projects to thousands of recruiters and industry leaders worldwide.
            </p>
          </div>

          <div style={styles.statRow}>
            <div style={styles.stat}>
              <span style={styles.statNum}>{platformStats.totalStudents}</span>
              <span style={styles.statLabel}>Students</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>{platformStats.totalRecruiters}</span>
              <span style={styles.statLabel}>Recruiters</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>{platformStats.totalProjects}</span>
              <span style={styles.statLabel}>Projects</span>
            </div>
          </div>

          <p style={styles.copyright}>LaunchPad &copy; {new Date().getFullYear()}</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={styles.rightPanel}>
          <div style={styles.rightContent}>

            <div style={styles.formHeader}>
              <h1 style={styles.formTitle}>Sign in</h1>
              <p style={styles.formSub}>Use your Google account to continue</p>
            </div>

            {/* Origin Error */}
            {originError && (
              <div style={styles.errorBox}>
                <p style={styles.errorTitle}>Google OAuth: Origin Not Registered</p>
                <p style={styles.errorDesc}>
                  Add <strong>{window.location.origin}</strong> to your Google Cloud Console under
                  APIs &amp; Services &rarr; Credentials &rarr; Authorized JavaScript Origins.
                </p>
              </div>
            )}

            {/* Google Sign-In */}
            <div style={styles.googleSection}>
              {actionLoading ? (
                <button id="google-signin-btn" disabled style={styles.loadingBtn}>
                  <Spinner size="sm" />
                  <span style={styles.loadingBtnText}>Signing in...</span>
                </button>
              ) : (
                <div id="google-signin-btn" style={styles.googleWrapper}>
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



            <p style={styles.footNote}>
              New here? Your account is created automatically on first sign in.
              By continuing you agree to our{' '}
              <span style={styles.footNoteLink}>Terms of Service</span> and{' '}
              <span style={styles.footNoteLink}>Privacy Policy</span>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Styles ── */
const styles = {
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f5f5f5',
  },

  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    padding: '24px 16px',
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
  },

  card: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    maxWidth: '880px',
    width: '100%',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
  },

  /* Left Panel */
  leftPanel: {
    background: '#1a2744',
    padding: '52px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '40px',
  },

  leftTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  brandMark: {
    width: '36px',
    height: '36px',
    background: '#2563eb',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.5px',
  },

  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
  },

  heroHeading: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
    margin: 0,
  },

  heroSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.7,
    margin: 0,
  },

  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },

  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  statNum: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1,
  },

  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    fontWeight: '500',
  },

  statDivider: {
    width: '1px',
    height: '32px',
    background: 'rgba(255,255,255,0.12)',
  },

  copyright: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.25)',
    margin: 0,
    letterSpacing: '0.3px',
  },

  /* Right Panel */
  rightPanel: {
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightContent: {
    width: '100%',
    padding: '52px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  formHeader: {
    marginBottom: '4px',
  },

  formTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    letterSpacing: '-0.4px',
  },

  formSub: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },

  /* Error box */
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '12px 14px',
  },

  errorTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#dc2626',
    margin: '0 0 4px 0',
  },

  errorDesc: {
    fontSize: '12px',
    color: '#dc2626',
    margin: 0,
    lineHeight: 1.5,
  },

  /* Google */
  googleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  googleWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },

  loadingBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#f9fafb',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'not-allowed',
    opacity: 0.7,
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
  },

  loadingBtnText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },

  /* Divider */
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e5e7eb',
  },

  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },

  /* Role grid */
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },

  roleBtn: {
    padding: '10px 8px',
    background: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.15s ease',
    letterSpacing: '0.2px',
  },

  roleBtnHover: {
    padding: '10px 8px',
    background: '#f0f7ff',
    border: '1px solid #2563eb',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#2563eb',
    transition: 'all 0.15s ease',
    letterSpacing: '0.2px',
  },

  footNote: {
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: 1.6,
    margin: '4px 0 0 0',
  },

  footNoteLink: {
    color: '#2563eb',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
