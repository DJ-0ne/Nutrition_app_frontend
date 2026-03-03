// =============================================
// FINAL OTPVerification.jsx - Auto-submit + Styling
// =============================================
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthContext } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuthContext();
  const inputRefs = useRef([]);

  // Get email from state or query params (for Google signup)
  const params = new URLSearchParams(location.search);
  const queryEmail = params.get('email');
  const stateEmail = location.state?.email;
  const email = queryEmail || stateEmail;

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  if (!email) {
    navigate('/Register');
    return null;
  }

  // ========== OTP input handlers ==========
  const handleChange = (index, e) => {
    const value = e.target.value;
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 6);

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus the next empty or last filled input
    const lastFilledIndex = digits.length - 1;
    const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  // ========== Submit logic ==========
  const performSubmit = async (code) => {
    if (isLoading) return; // prevent multiple submissions
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Verification failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Save tokens and user
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      updateUser(data.user);

      toast.success('Verification successful!');
      navigate(data.redirect || '/user/Home');

    } catch (error) {
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

  // Auto-submit when OTP is complete
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !isLoading) {
      performSubmit(code);
    }
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ========== Resend ==========
  const handleResend = async () => {
    setResendLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to resend code. Please try again.');
        return;
      }

      toast.success('A new verification code has been sent to your email.');

    } catch (error) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setResendLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding (unchanged) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
          alt="Fresh healthy ingredients"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-amber-800/85 to-amber-900/90"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="absolute right-0 top-0 h-full w-32 bg-white" 
             style={{ 
               clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)',
               opacity: '0.95'
             }}>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-white p-12 w-full">
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-black mb-3 tracking-tight">ABCDE Nutrition</h1>
            <p className="text-xl font-light text-amber-100">Verify Your Account</p>
          </div>

          <div className="space-y-4 w-full max-w-md">
            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Check Your Email</h3>
                <p className="text-sm text-amber-100">We sent a verification code</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Verification</h3>
                <p className="text-sm text-amber-100">Enter your 6-digit code</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Get Started</h3>
                <p className="text-sm text-amber-100">Access your dashboard</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 animate-float-slow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm font-medium">Secure your account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              <img 
                src="/abcdelogo.jpg" 
                alt="ABCDE Nutrition" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-amber-600 mt-1">Enter the code sent to {email}</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Verify Your Email</h2>
            <p className="text-amber-600 mt-2">Enter the 6-digit code sent to {email}</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp-0" className="block text-sm font-medium text-gray-700 mb-1.5">
                Verification Code
              </label>

              {/* Segmented OTP Inputs - modern styling */}
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
                    className="w-12 h-12 text-center text-xl font-semibold border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition duration-200 bg-white disabled:opacity-50"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Submit button remains as fallback */}
            <button
              type="submit"
              disabled={isLoading || !isOtpComplete}
              className="w-full bg-amber-500 text-white py-3.5 px-4 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-amber-200 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm font-medium text-amber-600 hover:text-amber-500 disabled:opacity-50"
            >
              {resendLoading ? 'Resending...' : 'Resend verification code'}
            </button>
          </div>

          {/* Back to Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Wrong email?{' '}
              <button 
                onClick={() => navigate('/Register')} 
                className="font-semibold text-amber-600 hover:text-amber-500 cursor-pointer"
              >
                Go back to register
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;