/* eslint-disable react-hooks/exhaustive-deps */
// Landing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentSpecialIndex, setCurrentSpecialIndex] = useState(0);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Slideshow data for the floating card
  const specials = [
    { name: "Quinoa power bowl", calories: "450", protein: "22" },
    { name: "Ugali Sukuma Wiki", calories: "380", protein: "12" },
    { name: "Githeri", calories: "420", protein: "18" },
    { name: "Nyama Choma", calories: "550", protein: "35" }
  ];

  // Hero images for slideshow
  const heroImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
  ];

  useEffect(() => {
    // Handle navbar scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // Slideshow intervals
    const cardInterval = setInterval(() => {
      setCurrentSpecialIndex((prev) => (prev + 1) % specials.length);
    }, 3000);

    const imageInterval = setInterval(() => {
      setCurrentHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(cardInterval);
      clearInterval(imageInterval);
    };
  }, []);

  return (
    <div className="w-full bg-white font-['Outfit'] overflow-x-hidden">
      {/* Navbar - Mobile Optimized */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <a href="#" className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-700 no-underline leading-tight">
            ABCDE ~<span className="text-teal-600 block sm:inline">Nutrition</span>
          </a>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-amber-50 text-amber-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#features" className="text-gray-700 hover:text-amber-700 transition-colors font-medium text-sm lg:text-base">Features</a>
            <a href="#framework" className="text-gray-700 hover:text-amber-700 transition-colors font-medium text-sm lg:text-base">The Framework</a>
            <a href="#founder" className="text-gray-700 hover:text-amber-700 transition-colors font-medium text-sm lg:text-base">About</a>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md mt-2 py-4 px-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-gray-700 hover:text-amber-700 py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#framework" className="text-gray-700 hover:text-amber-700 py-2" onClick={() => setMobileMenuOpen(false)}>The Framework</a>
              <a href="#founder" className="text-gray-700 hover:text-amber-700 py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <div className="min-h-screen w-full pt-16 sm:pt-20 md:pt-24">
        <div className="relative flex flex-col lg:flex-row lg:h-[calc(100vh-6rem)]">
          
          {/* Left Side - Main Content */}
          <div className="lg:w-1/2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 lg:py-16 flex items-center">
            <div className="w-full max-w-xl mx-auto lg:mx-0">
              {/* Badge */}
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-700 rounded-full animate-pulse"></div>
                  <span className="text-sm sm:text-base lg:text-lg font-semibold text-amber-800">Welcome to ABCDE Nutrition</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="mb-4 sm:mb-6">
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900">
                  Eat well,
                </span>
                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mt-1 sm:mt-2">
                  Live <span className="text-amber-700">vibrantly</span>
                </span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Kenya's first nutrition app built on clinical assessment methodology. 
                Real Kenyan foods. Household portions you actually use. Assessment before advice.
              </p>

              {/* CTA Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-all duration-300 font-medium shadow-lg shadow-amber-200 flex items-center justify-center group text-sm sm:text-base"
                >
                  Get started
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-teal-600 border-2 border-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-300 font-medium text-sm sm:text-base"
                >
                  Learn More
                </button>
              </div>

              {/* Stats - Responsive grid */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">200+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">Kenyan foods</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">KFCT</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">Data-backed</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">15+</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">Years expertise</div>
                </div>
              </div>

              {/* Trust Indicators - Scrollable on mobile */}
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex flex-nowrap sm:flex-wrap gap-3 sm:gap-4 min-w-max sm:min-w-0">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full sm:bg-transparent sm:p-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs sm:text-sm whitespace-nowrap">Certified nutritionists</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full sm:bg-transparent sm:p-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs sm:text-sm whitespace-nowrap">Science-based</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full sm:bg-transparent sm:p-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs sm:text-sm whitespace-nowrap">Personalized plans</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full sm:bg-transparent sm:p-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mr-1.5 sm:mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-xs sm:text-sm whitespace-nowrap">Expert guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image Slideshow - Mobile Optimized */}
          <div className="lg:w-1/2 h-[300px] sm:h-[400px] md:h-[500px] lg:h-full relative overflow-hidden bg-amber-50">
            {/* Slideshow Images */}
            {heroImages.map((image, index) => (
              <img 
                key={index}
                src={image}
                alt={`Fresh healthy food ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentHeroImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Bottom Text Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-4 sm:left-6 md:left-8 lg:left-10 right-4 sm:right-6 md:right-8 lg:right-10 text-white">
              <p className="text-sm sm:text-base lg:text-lg font-light mb-1 drop-shadow-lg">Fresh. Wholesome. Delicious.</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg">Real food for real people</p>
            </div>

            {/* Floating Card - Responsive positioning */}
            <div className="absolute top-4 sm:top-6 md:top-8 lg:top-10 right-4 sm:right-6 md:right-8 lg:right-10 bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl animate-float-slow max-w-[200px] sm:max-w-[240px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Today's special</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{specials[currentSpecialIndex].name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">{specials[currentSpecialIndex].calories} cal • {specials[currentSpecialIndex].protein}g protein</p>
                </div>
              </div>
            </div>

            {/* Decorative elements - Hidden on very small screens */}
            <div className="hidden sm:flex absolute bottom-12 sm:bottom-16 md:bottom-20 left-4 sm:left-6 md:left-8 lg:left-10 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl items-center justify-center animate-float-delayed">
              <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>

            {/* Slideshow Indicators */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 right-4 sm:right-6 md:right-8 lg:right-10 flex gap-1.5 sm:gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroImageIndex(index)}
                  className={`transition-all rounded-full ${
                    index === currentHeroImageIndex 
                      ? 'w-4 sm:w-5 h-1.5 sm:h-2 bg-white' 
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION - Mobile Optimized */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600">Why ABCDE Nutrition</span>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-3 sm:mt-4">Built for how Kenyans actually eat</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-3 sm:mt-4 px-4">
              No more guessing with foreign portion sizes. Track your nutrition using the foods and measurements you know.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Kenyan Food Database</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">200+ foods from the Kenya Food Composition Tables, searchable in English, Swahili, and local names.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Clinical Assessment</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">BMI calculations with medically neutral interpretation ranges. Assessment before advice, always.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-green-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Household Portions</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Log food in ladles, bunches, and pieces. Mapped to grams behind the scenes for accurate tracking.</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Nutrient Breakdown</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Energy, protein, carbs, fat, fiber, and sodium calculated from KFCT data for every meal you log.</p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Offline-First</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Works without internet. Your data syncs automatically when you're back online. Built for real Kenyan connectivity.</p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-green-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">M-Pesa Payments</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Subscribe with M-Pesa. No credit card needed. Three tiers designed to match your nutrition goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABCDE FRAMEWORK SECTION - Mobile Optimized */}
      <section id="framework" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600">The Methodology</span>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-3 sm:mt-4">The ABCDE of real nutrition</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-3 sm:mt-4 px-4">
              A comprehensive assessment framework used by nutrition professionals. The app brings this clinical methodology to your phone.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {/* A */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-teal-50 text-center hover:-translate-y-1 transition-transform border border-teal-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-teal-600 mb-2 sm:mb-3">A</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Anthropometric</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your body signals: height, weight, BMI, waist circumference</p>
            </div>

            {/* B */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-green-50 text-center hover:-translate-y-1 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-green-600 mb-2 sm:mb-3">B</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Biochemical</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your lab results: blood tests, nutrient levels, biomarkers</p>
            </div>

            {/* C */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-green-50 text-center hover:-translate-y-1 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-green-600 mb-2 sm:mb-3">C</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Clinical</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your health conditions: signs, symptoms, medical history</p>
            </div>

            {/* D */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-amber-50 text-center hover:-translate-y-1 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-700 mb-2 sm:mb-3">D</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Dietary</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">What you actually eat: food intake, portions, meal patterns</p>
            </div>

            {/* E */}
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-amber-50 text-center hover:-translate-y-1 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-700 mb-2 sm:mb-3">E</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Economic & Social</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your real life: income, access, cultural preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION - Mobile Optimized */}
      <section id="founder" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-amber-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600">Meet the Founder</span>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-3 sm:mt-4">Built by a nutrition professional,<br className="hidden sm:block" />for real-world practice</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="relative flex-shrink-0">
              <img 
                src="/client.jpeg"
                alt="Geraldine Kaari, Founder of ABCDE Nutrition"
                className="w-48 sm:w-56 md:w-64 lg:w-72 h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-2xl shadow-xl mx-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl text-gray-900">Geraldine Kaari</h3>
              <p className="text-base sm:text-lg md:text-xl text-amber-700 font-semibold mt-2">Systems Integration Strategist | Founder, ABCDE Nutrition</p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mt-4 sm:mt-6">
                With 15+ years translating health policy into sustainable systems across East Africa, Geraldine built ABCDE Nutrition to bridge the gap between clinical nutrition methodology and everyday food choices. The app brings professional-grade assessment tools to the people who need them most.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-amber-700 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Kenyatta University</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-600 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">15+ Years</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">East Africa Focus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Mobile Optimized */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gray-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-amber-700/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-l from-teal-600/10 to-transparent rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4 sm:mb-6">Ready to eat with<br />intention?</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join the waitlist for Kenya's first nutrition app built on clinical assessment methodology and real local food data.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-amber-700 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-amber-800 transition-all hover:-translate-y-1 shadow-2xl shadow-amber-700/30"
          >
            Get Early Access
          </button>
        </div>
      </section>

      {/* FOOTER - Mobile Optimized */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 md:px-8 bg-gray-800 text-center">
        <div className="font-['DM_Serif_Display'] text-lg sm:text-xl text-amber-700 mb-2 sm:mb-3">ABCDE Nutrition</div>
        <p className="text-xs sm:text-sm text-gray-500">&copy; 2026 ABCDE Nutrition. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        @media (min-width: 768px) {
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes float-delayed {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;