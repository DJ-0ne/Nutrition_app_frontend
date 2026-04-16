// =============================================
// Login.jsx  –  Step 1: credentials only
// On success the backend sends an MFA OTP and
// returns { otp_required: true, email }.
// The user is then sent to /otp?mode=login.
// =============================================
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const appName      = 'ABCDE Nutrition';
const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

const Login = () => {
  const [credentials, setCredentials]   = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { user, error: authError } = useAuthContext();
  const navigate = useNavigate();

  // If already authenticated, redirect straight away
  useEffect(() => {
    if (user) {
      if (user.role === 'system_admin' || user.is_staff || user.is_superuser) {
        navigate('/admin/dashboard');
      } else if (user.role === 'nutritionist') {
        navigate('/nutritionist/dashboard');
      } else {
        navigate('/user/Home');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  // ─────────────────────────────────────────────────────────────
  //  Credential submission  →  triggers OTP send on the backend
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email:    credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Surface the first serializer error or a generic message
        const msg =
          data?.non_field_errors?.[0] ||
          data?.detail ||
          data?.error ||
          'Invalid email or password.';
        toast.error(msg);
        setIsLoading(false);
        return;
      }

      // Backend validated credentials and dispatched OTP
      if (data.otp_required) {
        toast.success('Verification code sent – please check your email.');
        navigate(`/otp?email=${encodeURIComponent(data.email)}&mode=login`);
        return;
      }

      // Fallback: if the server somehow returns tokens directly (shouldn't happen)
      toast.error('Unexpected server response. Please try again.');
      setIsLoading(false);

    } catch {
      toast.error('Network error. Please check your connection.');
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Google Sign-In
  // ─────────────────────────────────────────────────────────────
  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      window.location.href = `${API_BASE_URL}/auth/google/login/`;
    }, 320);
  };

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left branding panel ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=2353&q=80"
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
            <h1 className="text-5xl font-black mb-3 tracking-tight">{appName}</h1>
            <p className="text-xl font-light text-amber-100">Eat Well • Live Better • Thrive</p>
          </div>

          <div className="space-y-4 w-full max-w-md">
            {[
              { icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', title: 'Personalized Plans', sub: 'Tailored to your goals' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Track Progress', sub: 'Monitor your journey' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Expert Guidance', sub: 'Certified nutritionists' },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-amber-500 text-white p-2 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-amber-100">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-8 text-center">
            <div><div className="text-3xl font-bold">50K+</div><div className="text-sm text-amber-100">Happy Clients</div></div>
            <div className="w-px bg-white/30" />
            <div><div className="text-3xl font-bold">100K+</div><div className="text-sm text-amber-100">Meals Planned</div></div>
          </div>

          <div className="absolute bottom-10 left-10 bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 animate-float-slow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="text-sm font-medium">Fresh daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-md w-full">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-amber-500 flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              <img src="/abcdelogo.png" alt="ABCDE Nutrition" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{appName}</h2>
            <p className="text-amber-600 mt-1">Welcome back!</p>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-amber-600 mt-2">Sign in to continue your nutrition journey</p>
          </div>

          {/* Auth context error (from AuthContext, e.g. token expiry messages) */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {authError}
            </div>
          )}

          {/* MFA notice */}
          <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-amber-700">
              A one-time verification code will be emailed to you after entering your credentials.
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email" id="email" name="email"
                  value={credentials.email} onChange={handleChange}
                  required autoComplete="username" disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={credentials.password} onChange={handleChange}
                  required autoComplete="current-password" disabled={isLoading}
                  className="w-full pl-10 pr-10 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3.5 text-amber-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full cursor-pointer bg-amber-500 text-white py-3.5 px-4 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-amber-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending code...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-amber-50 to-white text-amber-600">or continue with</span>
              </div>
            </div>
          </div>

          <button
            type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 py-3.5 rounded-xl transition-all duration-200 font-medium text-gray-700 shadow-sm disabled:opacity-70 disabled:cursor-wait"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent animate-spin rounded-full" />
                <span>Signing in to Google...</span>
              </>
            ) : (
              <>
                <img
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_18dp.png"
                  alt="Google" className="w-5 h-5"
                />
                Sign in with Google
              </>
            )}
          </button>

          {/* Sign up link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              New to {appName}?{' '}
              <button onClick={() => navigate('/Register')} className="font-semibold text-amber-600 hover:text-amber-500 cursor-pointer">
                Create account
              </button>
            </p>
          </div>

          {/* Divider + tips */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-amber-50 to-white text-amber-600">Join the community</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs">
            {['Free account', 'No commitment', 'Cancel anytime'].map((label) => (
              <span key={label} className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {label}
              </span>
            ))}
          </div>

          <div className="text-center mt-8 pt-6 border-t border-amber-200">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} {appName}. All rights reserved.</p>
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

export default Login;