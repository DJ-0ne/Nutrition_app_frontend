// =============================================
// GoogleCallback.jsx
//
// Handles the redirect back from Google OAuth.
// The backend Google callback view should now:
//   • Revoke any existing sessions for the user
//   • Create a fresh session
//   • Return tokens as before
//
// The "already_logged_in_elsewhere" error is no
// longer generated (single-session blocking has
// been replaced by MFA).  The case is kept here
// only as a graceful fallback for old deployments.
// =============================================
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const location   = useLocation();
  const { updateUser } = useAuthContext();
  const processed  = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params      = new URLSearchParams(location.search);
    const googleError = params.get('google_error');
    const needsOtp    = params.get('needs_otp');

    // ── Error from backend ───────────────────────────────────
    if (googleError) {
      const errorMessages = {
        account_not_registered:  'This Google account is not registered. Please sign up or use a different account.',
        account_already_exists:  'An account with this email already exists. Please sign in instead.',
        verification_failed:     'Google verification failed. Please try again.',
        no_id_token:             'No ID token received from Google. Please try again.',
        no_code:                 'No authorisation code received. Please try again.',
        // Kept as graceful fallback – should not occur after backend update
        already_logged_in_elsewhere:
          'Your previous session was signed out. Please sign in again.',
      };

      const message = errorMessages[googleError] || 'Google sign-in failed. Please try again.';
      toast.error(message);
      window.location.href = `${window.location.origin}/#/login`;
      return;
    }

    // ── New Google sign-up needs OTP activation ──────────────
    if (needsOtp) {
      const email = params.get('email');
      toast.success('Account created! Please verify your email with the code we sent.');
      window.location.href = `${window.location.origin}/#/otp?email=${encodeURIComponent(email)}&mode=activation`;
      return;
    }

    // ── Successful Google login ──────────────────────────────
    try {
      const access  = params.get('access');
      const refresh = params.get('refresh');
      const userStr = params.get('user');

      if (!access || !refresh || !userStr) {
        throw new Error('Missing tokens or user data from Google.');
      }

      localStorage.setItem('access_token',  access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', userStr);

      const userData = JSON.parse(userStr);
      updateUser(userData);

      toast.success('Successfully signed in with Google!');

      const isAdmin =
        userData.role === 'system_admin' ||
        userData.is_staff      === true  ||
        userData.is_superuser  === true;

      const isNutritionist = userData.role === 'nutritionist';

      const targetPath = isAdmin
        ? '/admin/dashboard'
        : isNutritionist
          ? '/nutritionist/dashboard'
          : '/user/Home';

      window.location.href = `${window.location.origin}/#${targetPath}`;

    } catch (error) {
      console.error('GoogleCallback error:', error);
      toast.error('Google sign-in failed. Please try again.');
      window.location.href = `${window.location.origin}/#/login`;
    }
  }, [location, updateUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Completing Google sign-in…</p>
      </div>
    </div>
  );
};

export default GoogleCallback;