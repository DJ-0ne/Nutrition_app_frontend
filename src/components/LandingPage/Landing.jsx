/* eslint-disable react-hooks/exhaustive-deps */
// Landing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentSpecialIndex, setCurrentSpecialIndex] = useState(0);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

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
    // Handle entrance animations
    const elements = document.querySelectorAll('.animate-entrance');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('opacity-100', 'translate-y-0');
      }, index * 150);
    });

    // Handle navbar scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // Slideshow interval for floating card
    const cardInterval = setInterval(() => {
      setCurrentSpecialIndex((prev) => (prev + 1) % specials.length);
    }, 3000);

    // Slideshow interval for hero image
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
    <div className="w-full bg-white font-['Outfit']">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <a href="#" className="font-['DM_Serif_Display'] text-5xl text-amber-700 no-underline">
            ABCDE ~<span className="text-teal-600">Nutrition</span>
          </a>
          {/* <div className="flex items-center gap-8">
            <a href="#features" className="hidden md:block text-gray-700 hover:text-amber-700 transition-colors font-medium">Features</a>
            <a href="#framework" className="hidden md:block text-gray-700 hover:text-amber-700 transition-colors font-medium">The Framework</a>
            <a href="#founder" className="hidden md:block text-gray-700 hover:text-amber-700 transition-colors font-medium">About</a>
          </div> */}
        </div>
      </nav>

      {/* Hero Section - Full screen */}
      <div className="h-screen w-full overflow-hidden">
        <div className="relative h-full w-full flex flex-col lg:flex-row">
          
          {/* Left Side - Main Content */}
          <div className="relative lg:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-white">
            
            {/* Main Content */}
            <div className="relative z-10 max-w-xl">
              {/* Badge */}
              <div className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 mb-6 py-12">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-amber-700 rounded-full animate-pulse"></div>
                  <span className="text-xl font-semibold text-amber-800">Welcome to ABCDE Nutrition</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 delay-100">
                <span className="block text-5xl md:text-6xl lg:text-7xl font-light text-gray-900">
                  Eat well,
                </span>
                <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mt-2">
                  Live <span className="text-amber-700">vibrantly</span>
                </span>
              </h1>

              {/* Description */}
              <p className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 delay-200 text-lg text-gray-600 mt-6 leading-relaxed">
                Kenya's first nutrition app built on clinical assessment methodology. 
                Real Kenyan foods. Household portions you actually use. Assessment before advice.
              </p>

              {/* CTA Buttons */}
              <div className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 delay-300 flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-amber-700 text-white rounded-xl hover:bg-amber-800 cursor-pointer transition-all duration-300 font-medium shadow-lg shadow-amber-200 flex items-center justify-center group"
                >
                  Get started
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 bg-transparent text-teal-600 border-2 cursor-pointer border-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-300 font-medium"
                >
                  Log in
                </button>
              </div>

              {/* Stats */}
              <div className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 delay-400 flex gap-8 sm:gap-12 mt-10">
                <div>
                  <div className="text-3xl font-bold text-gray-900">200+</div>
                  <div className="text-sm text-gray-500 mt-1">Kenyan foods</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">KFCT</div>
                  <div className="text-sm text-gray-500 mt-1">Data-backed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">15+</div>
                  <div className="text-sm text-gray-500 mt-1">Years expertise</div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="animate-entrance opacity-0 translate-y-10 transition-all duration-700 delay-500 flex flex-wrap items-center gap-4 mt-10 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Certified nutritionists</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Science-based approach</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Personalized plans</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Expert guidance</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>200+ recipes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image Slideshow */}
          <div className="relative lg:w-1/2 h-full overflow-hidden bg-amber-50">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            
            {/* Bottom Text Overlay */}
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <p className="text-lg font-light mb-1 drop-shadow-lg">Fresh. Wholesome. Delicious.</p>
              <p className="text-3xl font-bold drop-shadow-lg">Real food for real people</p>
            </div>

            {/* Floating Card - Slideshow */}
            <div className="absolute top-10 right-10 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's special</p>
                  <p className="font-semibold text-gray-900">{specials[currentSpecialIndex].name}</p>
                  <p className="text-xs text-gray-500 mt-1">{specials[currentSpecialIndex].calories} cal • {specials[currentSpecialIndex].protein}g protein</p>
                </div>
              </div>
            </div>

            {/* Decorative floating elements - Professional SVG icons */}
            <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float-delayed">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div className="absolute top-1/3 left-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-float-slow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>

            {/* Slideshow Indicators */}
            <div className="absolute bottom-24 right-10 flex gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentHeroImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentHeroImageIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 sm:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600">Why ABCDE Nutrition</span>
            <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-gray-900 mt-4">Built for how Kenyans actually eat</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              No more guessing with foreign portion sizes. Track your nutrition using the foods and measurements you know.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kenyan Food Database</h3>
              <p className="text-gray-600 leading-relaxed">200+ foods from the Kenya Food Composition Tables, searchable in English, Swahili, and local names.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clinical Assessment</h3>
              <p className="text-gray-600 leading-relaxed">BMI calculations with medically neutral interpretation ranges. Assessment before advice, always.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Household Portions</h3>
              <p className="text-gray-600 leading-relaxed">Log food in ladles, bunches, and pieces. Mapped to grams behind the scenes for accurate tracking.</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nutrient Breakdown</h3>
              <p className="text-gray-600 leading-relaxed">Energy, protein, carbs, fat, fiber, and sodium calculated from KFCT data for every meal you log.</p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Offline-First</h3>
              <p className="text-gray-600 leading-relaxed">Works without internet. Your data syncs automatically when you're back online. Built for real Kenyan connectivity.</p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">M-Pesa Payments</h3>
              <p className="text-gray-600 leading-relaxed">Subscribe with M-Pesa. No credit card needed. Three tiers designed to match your nutrition goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABCDE FRAMEWORK SECTION */}
      <section id="framework" className="py-24 px-4 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600">The Methodology</span>
            <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-gray-900 mt-4">The ABCDE of real nutrition</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              A comprehensive assessment framework used by nutrition professionals. The app brings this clinical methodology to your phone.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            {/* A */}
            <div className="p-6 rounded-2xl bg-teal-50 text-center hover:-translate-y-2 transition-transform border border-teal-100">
              <div className="font-['DM_Serif_Display'] text-6xl text-teal-600 mb-3">A</div>
              <h4 className="font-bold text-gray-900 mb-2">Anthropometric</h4>
              <p className="text-sm text-gray-600">Your body signals: height, weight, BMI, waist circumference</p>
            </div>

            {/* B */}
            <div className="p-6 rounded-2xl bg-green-50 text-center hover:-translate-y-2 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-6xl text-green-600 mb-3">B</div>
              <h4 className="font-bold text-gray-900 mb-2">Biochemical</h4>
              <p className="text-sm text-gray-600">Your lab results: blood tests, nutrient levels, biomarkers</p>
            </div>

            {/* C */}
            <div className="p-6 rounded-2xl bg-green-50 text-center hover:-translate-y-2 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-6xl text-green-600 mb-3">C</div>
              <h4 className="font-bold text-gray-900 mb-2">Clinical</h4>
              <p className="text-sm text-gray-600">Your health conditions: signs, symptoms, medical history</p>
            </div>

            {/* D */}
            <div className="p-6 rounded-2xl bg-amber-50 text-center hover:-translate-y-2 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-6xl text-amber-700 mb-3">D</div>
              <h4 className="font-bold text-gray-900 mb-2">Dietary</h4>
              <p className="text-sm text-gray-600">What you actually eat: food intake, portions, meal patterns</p>
            </div>

            {/* E */}
            <div className="p-6 rounded-2xl bg-amber-50 text-center hover:-translate-y-2 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-6xl text-amber-700 mb-3">E</div>
              <h4 className="font-bold text-gray-900 mb-2">Economic & Social</h4>
              <p className="text-sm text-gray-600">Your real life: income, access, cultural preferences</p>
            </div>
          </div>

         
        </div>
      </section>

      {/* FOUNDER SECTION - Clean image without background color */}
      <section id="founder" className="py-24 px-4 sm:px-8 bg-gradient-to-r from-amber-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-teal-600">Meet the Founder</span>
            <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-gray-900 mt-4">Built by a nutrition professional,<br />for real-world practice</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src='/client.jpeg'
                alt="Geraldine Kaari, Founder of ABCDE Nutrition"
                className="w-72 h-72 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div>
              <h3 className="font-['DM_Serif_Display'] text-4xl text-gray-900">Geraldine Kaari</h3>
              <p className="text-xl text-amber-700 font-semibold mt-2">Systems Integration Strategist | Founder, ABCDE Nutrition</p>
              <p className="text-lg text-gray-600 leading-relaxed mt-6">
                With 15+ years translating health policy into sustainable systems across East Africa, Geraldine built ABCDE Nutrition to bridge the gap between clinical nutrition methodology and everyday food choices. The app brings professional-grade assessment tools to the people who need them most.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-3 h-3 bg-amber-700 rounded-full"></div>
                  <span className="font-medium text-gray-700">Kenyatta University</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                  <span className="font-medium text-gray-700">15+ Years in Nutrition</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="font-medium text-gray-700">East Africa Focus</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 sm:px-8 bg-gray-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-amber-700/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-teal-600/10 to-transparent rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-['DM_Serif_Display'] text-4xl md:text-5xl text-white mb-6">Ready to eat with<br />intention?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join the waitlist for Kenya's first nutrition app built on clinical assessment methodology and real local food data.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-12 py-5 bg-amber-700 text-white rounded-2xl text-lg font-bold hover:bg-amber-800 transition-all hover:-translate-y-1 shadow-2xl shadow-amber-700/30"
          >
            Get Early Access
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-8 bg-gray-800 text-center">
        <div className="font-['DM_Serif_Display'] text-xl text-amber-700 mb-3">ABCDE Nutrition</div>
        <p className="text-gray-500">&copy; 2026 ABCDE Nutrition. All rights reserved.</p>
      </footer>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-entrance {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .animate-entrance.opacity-100 {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default Landing;