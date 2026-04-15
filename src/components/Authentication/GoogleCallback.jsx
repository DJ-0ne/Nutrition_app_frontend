// components/Authentication/GoogleCallback.jsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const location = useLocation();
  const { updateUser } = useAuthContext();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(location.search);
    const googleError = params.get('google_error');
    const needsOtp = params.get('needs_otp');

    if (googleError) {
      let errorMessage = 'Google sign-in failed';

      if (googleError === 'account_not_registered') {
        errorMessage = 'This account is not registered. Please sign up or use a different account.';
      } else if (googleError === 'account_already_exists') {
        errorMessage = 'This account already exists. Please log in instead.';
      } else if (googleError === 'verification_failed') {
        errorMessage = 'Google verification failed. Please try again.';
      } else if (googleError === 'no_id_token') {
        errorMessage = 'No ID token received from Google.';
      } else if (googleError === 'no_code') {
        errorMessage = 'No authorization code received.';
      } else if (googleError === 'already_logged_in_elsewhere') {
        // ← THIS IS THE NEW CASE (exactly what you asked for)
        errorMessage = 'You are already logged in on another device or browser.\n\n' +
                      'Please log out from the other session first before signing in here.';
      }

      toast.error(errorMessage);
      window.location.href = `${window.location.origin}/#/login`;
      return;
    }

    // Handle OTP redirect for signup
    if (needsOtp) {
      const email = params.get('email');
      toast.success('Account created successfully! Please verify your email with OTP.');
      window.location.href = `${window.location.origin}/#/otp?email=${encodeURIComponent(email)}`;
      return;
    }

    // Normal successful Google login
    try {
      const access = params.get('access');
      const refresh = params.get('refresh');
      const userStr = params.get('user');

      if (!access || !refresh || !userStr) {
        throw new Error('Missing tokens or user data from Google');
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', userStr);

      const userData = JSON.parse(userStr);
      updateUser(userData);

      toast.success('Successfully signed in with Google!');

      const isAdmin =
        userData.role === 'system_admin' ||
        userData.is_staff === true ||
        userData.is_superuser === true;

      const targetPath = isAdmin ? '/admin/dashboard' : '/user/Home';

      window.location.href = `${window.location.origin}/#${targetPath}`;

    } catch (error) {
      console.error('GoogleCallback error:', error);
      toast.error('Google sign-in failed');
      window.location.href = `${window.location.origin}/#/login`;
    }
  }, [location, updateUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;