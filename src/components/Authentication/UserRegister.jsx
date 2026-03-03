// =============================================
// FULL UPDATED Register.jsx - WITH GOOGLE SPINNER + OTP flow
// =============================================
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Phone, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.VITE_API_URL;

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // ← NEW
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const navigate = useNavigate();

  // Username check function
  const checkUsernameAvailability = async (value) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-username/?username=${value}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Username handler with debounce
  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    
    const timeoutId = setTimeout(() => {
      if (value.length >= 3) {
        checkUsernameAvailability(value);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestData = {
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        password: password,
        password2: confirmPassword,
      };

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && typeof data === 'object') {
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError)) {
            toast.error(firstError[0]);
          } else {
            toast.error(firstError);
          }
        } else {
          toast.error('Registration failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      toast.success('Account created! Please check your email for verification code.');
      
      // Instead of saving tokens (since user is inactive), redirect to OTP with email
      navigate('/otp', { state: { email: email.toLowerCase().trim() } });

    } catch (error) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATED Google Sign-Up with spinner
  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);
    const googleUrl = `${API_BASE_URL}/auth/google/signup/`;
    
    setTimeout(() => {
      window.location.href = googleUrl;
    }, 320);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding with Image */}
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
            <p className="text-xl font-light text-amber-100">Start Your Journey Today</p>
          </div>

          <div className="space-y-4 w-full max-w-md">
            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Personal Profile</h3>
                <p className="text-sm text-amber-100">Create your personalized account</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Customized Plans</h3>
                <p className="text-sm text-amber-100">Get meal plans tailored to you</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 transform hover:scale-105 transition-all duration-300">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Track Progress</h3>
                <p className="text-sm text-amber-100">Monitor your health journey</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 animate-float-slow">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="text-sm font-medium">Begin your journey</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-amber-600 mt-1">Join ABCDE Nutrition</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
            <p className="text-amber-600 mt-2">Start your personalized nutrition journey</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... all form fields unchanged (name, email, username, phone, password, etc.) ... */}
            {/* (I kept the full form exactly as you had it - only the Google button was updated) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                    placeholder="First"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                    placeholder="Last"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-amber-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-amber-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full pl-10 pr-12 py-3 border ${
                    usernameAvailable === true ? 'border-green-500' :
                    usernameAvailable === false ? 'border-red-500' : 'border-amber-200'
                  } rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white`}
                  placeholder="Choose a username"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {checkingUsername ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                  ) : usernameAvailable === true ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : usernameAvailable === false ? (
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {usernameAvailable === false && (
                <p className="text-red-500 text-xs mt-1">Username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-green-500 text-xs mt-1">Username is available!</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-amber-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="+254 700-000-000"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="Create a password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-400 hover:text-amber-600 transition-colors duration-200"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showPassword ? 'hide' : 'show'}
                      initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 10, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200 bg-white"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-400 hover:text-amber-600 transition-colors duration-200"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={showConfirmPassword ? 'hide' : 'show'}
                      initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 10, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 text-white py-3.5 px-4 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-200 transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-amber-200 mt-6 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Google Sign-Up */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-amber-50 to-white text-amber-600">
                  or sign up with
                </span>
              </div>
            </div>
          </div>

          {/* UPDATED GOOGLE BUTTON WITH SPINNER */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 py-3.5 rounded-xl transition-all duration-200 font-medium text-gray-700 shadow-sm disabled:opacity-70 disabled:cursor-wait"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent animate-spin rounded-full"></div>
                <span>Signing up to Google...</span>
              </>
            ) : (
              <>
                <img
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_18dp.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign up with Google
              </>
            )}
          </button>

          {/* Terms and Login Link */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-xs text-gray-500">
              By registering, you agree to our{' '}
              <a href="#" className="text-amber-600 font-medium hover:text-amber-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-amber-600 font-medium hover:text-amber-500">
                Privacy Policy
              </a>
            </p>
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="font-semibold text-amber-600 hover:text-amber-500 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-amber-50 to-white text-amber-600">Join 50K+ members</span>
            </div>
          </div>

          {/* Quick Benefits */}
          <div className="flex justify-center gap-4 text-xs">
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Free account
            </span>
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Personalized plans
            </span>
            <span className="flex items-center text-gray-600">
              <svg className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Cancel anytime
            </span>
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

export default Register;