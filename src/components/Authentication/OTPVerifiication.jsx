// =============================================
// OTPVerification.jsx
// Handles two modes via ?mode= query param:
//   - activation (default) → verify-otp     (inactive account)
//   - login                → verify-login-otp (MFA after credentials)
// =============================================
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthContext } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

const OTPVerification = () => {
  const [otp, setOtp]                   = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const location  = useLocation();
  const navigate  = useNavigate();
  const { updateUser } = useAuthContext();
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  // ── Resolve email and mode from URL / navigation state ──────
  const params     = new URLSearchParams(location.search);
  const queryEmail = params.get('email');
  const stateEmail = location.state?.email;
  const email      = queryEmail || stateEmail;

  // mode: 'login' | 'activation' (default)
  const queryMode  = params.get('mode');
  const stateMode  = location.state?.mode;
  const mode       = queryMode || stateMode || 'activation';

  const isLoginMode = mode === 'login';

  // Derive endpoint and resend mode from mode flag
  const verifyEndpoint = isLoginMode
    ? `${API_BASE_URL}/auth/verify-login-otp/`
    : `${API_BASE_URL}/auth/verify-otp/`;

  const resendMode = isLoginMode ? 'login' : 'activation';

  // ── Redirect if no email present ────────────────────────────
  useEffect(() => {
    if (!email) navigate('/Register');
  }, [email, navigate]);

  // ── Auto-focus first input ───────────────────────────────────
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // ── Cooldown timer cleanup ───────────────────────────────────
  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  if (!email) return null;

  // ─────────────────────────────────────────────────────────────
  //  OTP input handlers
  // ─────────────────────────────────────────────────────────────

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits  = e.clipboardData.getData('text').replace(/\D/g, '').split('').slice(0, 6);
    const newOtp  = [...otp];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const focusIndex = Math.min(digits.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ─────────────────────────────────────────────────────────────
  //  Submit
  // ─────────────────────────────────────────────────────────────

  const performSubmit = async (code) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Verification failed. Please try again.');
        setIsLoading(false);
        // Clear inputs on wrong code so user can retype quickly
        if (response.status === 400) {
          setOtp(['', '', '', '', '', '']);
          setTimeout(() => inputRefs.current[0]?.focus(), 50);
        }
        return;
      }

      // Persist auth data
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUser(data.user);

      const successMsg = isLoginMode
        ? 'Signed in successfully!'
        : 'Email verified! Account activated.';

      toast.success(successMsg);
      navigate(data.redirect || '/user/Home');

    } catch {
      toast.error('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    performSubmit(code);
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isLoading) performSubmit(code);
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────
  //  Resend
  // ─────────────────────────────────────────────────────────────

  const startCooldown = () => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, mode: resendMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to resend code. Please try again.');
        return;
      }

      toast.success('A new verification code has been sent to your email.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      startCooldown();

    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setResendLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Derived UI values
  // ─────────────────────────────────────────────────────────────

  const isOtpComplete    = otp.every((d) => d !== '');
  const pageTitle        = isLoginMode ? 'Two-Factor Verification' : 'Verify Your Email';
  const pageSubtitle     = isLoginMode
    ? `Enter the 6-digit code sent to ${email} to complete sign-in.`
    : `Enter the 6-digit code sent to ${email} to activate your account.`;
  const backLabel        = isLoginMode ? 'Back to sign in' : 'Go back to register';
  const backPath         = isLoginMode ? '/login' : '/Register';
  const leftHeading      = isLoginMode ? 'Two-Factor Auth' : 'Verify Your Account';
  const leftSubheading   = isLoginMode
    ? 'One extra step keeps your account safe'
    : 'Almost there – verify your email';

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
          alt="Fresh healthy ingredients"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-amber-800/85 to-amber-900/90" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div
          className="absolute right-0 top-0 h-full w-32 bg-white"
          style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)', opacity: '0.95' }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 w-full">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-black mb-3 tracking-tight">ABCDE Nutrition</h1>
            <p className="text-xl font-light text-amber-100">{leftHeading}</p>
            <p className="text-sm text-amber-200 mt-1">{leftSubheading}</p>
          </div>

          <div className="space-y-4 w-full max-w-md">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
                title: 'Check Your Email',
                sub:   'We sent a verification code',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ),
                title: 'Secure Verification',
                sub:   'Enter your 6-digit code',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: isLoginMode ? 'Access Your Account' : 'Get Started',
                sub:   isLoginMode ? 'Securely sign in'    : 'Access your dashboard',
              },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-amber-500 text-white p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-amber-100">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-10 left-10 bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 animate-float-slow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm font-medium">Secure your account</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right OTP form ──────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-md w-full">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              <img src="/abcdelogo.jpg" alt="ABCDE Nutrition" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{pageTitle}</h2>
            <p className="text-amber-600 mt-1 text-sm">{pageSubtitle}</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{pageTitle}</h2>
            <p className="text-amber-600 mt-2">{pageSubtitle}</p>
          </div>

          {/* MFA context banner (login mode only) */}
          {isLoginMode && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800">
                For your security, we require a verification code every time you sign in.
                Any previous sessions will be ended once you verify.
              </p>
            </div>
          )}

          {/* OTP form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp-0" className="block text-sm font-medium text-gray-700 mb-3">
                Verification Code
              </label>

              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    disabled={isLoading}
                    className={`
                      w-12 h-14 text-center text-xl font-semibold rounded-xl border transition duration-200 bg-white
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none
                      disabled:opacity-50
                      ${digit ? 'border-amber-400 bg-amber-50' : 'border-amber-200'}
                    `}
                    required
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOtpComplete}
              className="w-full bg-amber-500 text-white py-3.5 px-4 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-amber-200 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                isLoginMode ? 'Complete Sign In' : 'Verify Account'
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-4 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend available in <span className="font-medium text-amber-500">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm font-medium text-amber-600 hover:text-amber-500 disabled:opacity-50"
              >
                {resendLoading ? 'Resending...' : "Didn't receive a code? Resend"}
              </button>
            )}
          </div>

          {/* Back link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLoginMode ? 'Wrong account?' : 'Wrong email?'}{' '}
              <button
                onClick={() => navigate(backPath)}
                className="font-semibold text-amber-600 hover:text-amber-500 cursor-pointer"
              >
                {backLabel}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default OTPVerification;