/* eslint-disable react-hooks/exhaustive-deps */
// Landing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/auth/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { apiBaseURL } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const [showConsultModal, setShowConsultModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    notes: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitConsultation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseURL}/public/book-consultation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send request');

      toast.success('Consultation request sent successfully! Our team will contact you soon.');
      setShowConsultModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        preferred_date: '',
        preferred_time: '',
        notes: '',
      });
    } catch (err) {
      toast.error('Failed to send consultation request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full bg-white font-['Outfit'] overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          <a
            href="#"
            className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-700 no-underline leading-tight"
          >
            ABCDE ~<span className="text-teal-600 block sm:inline">Nutrition</span>
          </a>
        </div>
      </nav>

      {/* HERO: Meet the Founder */}
      <section className="pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-r from-amber-50 via-white to-teal-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 sm:gap-10 md:gap-12 items-center">
            {/* Founder Photo */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0">
              <img
                src="/client.jpeg"
                alt="Geraldine Kaari, Founder of ABCDE Nutrition"
                className="w-64 sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium text-teal-700">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                Founder
              </div>
            </div>

            {/* Founder Content */}
            <div className="text-center md:text-left flex-1">
              <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full text-sm font-semibold text-amber-800 mb-6">
                Meet the Founder
              </span>

              <h1 className="font-['DM_Serif_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-none mb-4">
                Geraldine Kaari
              </h1>
              <p className="text-xl sm:text-2xl text-amber-700 font-semibold mb-6">
                Systems Integration Strategist &amp; Founder, ABCDE Nutrition
              </p>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto md:mx-0">
                With 15+ years translating health policy into sustainable systems across East Africa, Geraldine built ABCDE Nutrition to bridge the gap between clinical nutrition methodology and everyday Kenyan food choices.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mt-8">
                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-3 h-3 bg-amber-700 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Kenyatta University</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-md border border-gray-100">
                  <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">15+ Years East Africa</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center md:justify-start">
                <button
                  onClick={() => setShowConsultModal(true)}
                  className="px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 text-lg"
                >
                  Book Consultation
                  <span className="text-xl">→</span>
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-4 border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-2xl transition-all hover:-translate-y-0.5 text-lg"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-600">Why ABCDE Nutrition</span>
            <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-3 sm:mt-4">
              Built for how Kenyans actually eat
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-3 sm:mt-4 px-4">
              No more guessing with foreign portion sizes. Track your nutrition using the foods and measurements you know.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Kenyan Food Database</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">200+ foods from the Kenya Food Composition Tables, searchable in English, Swahili, and local names.</p>
            </div>

            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-teal-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Clinical Assessment</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">BMI calculations with neutral interpretation ranges.</p>
            </div>

            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-green-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Household Portions</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Log food in ladles, bunches, and pieces. Mapped to grams behind the scenes for accurate tracking.</p>
            </div>

            <div className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
              <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-amber-50 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Nutrient Breakdown</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Energy, protein, carbs, fat, fiber, and sodium calculated from KFCT data for every meal you log.</p>
            </div>

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

      {/* ABCDE FRAMEWORK SECTION */}
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
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-teal-50 text-center hover:-translate-y-1 transition-transform border border-teal-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-teal-600 mb-2 sm:mb-3">A</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Anthropometric</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your body signals: height, weight, BMI, waist circumference</p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-green-50 text-center hover:-translate-y-1 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-green-600 mb-2 sm:mb-3">B</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Biochemical</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your lab results: blood tests, nutrient levels, biomarkers</p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-green-50 text-center hover:-translate-y-1 transition-transform border border-green-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-green-600 mb-2 sm:mb-3">C</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Clinical</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your health conditions: signs, symptoms, medical history</p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-amber-50 text-center hover:-translate-y-1 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-700 mb-2 sm:mb-3">D</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Dietary</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">What you actually eat: food intake, portions, meal patterns</p>
            </div>
            <div className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-amber-50 text-center hover:-translate-y-1 transition-transform border border-amber-100">
              <div className="font-['DM_Serif_Display'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-amber-700 mb-2 sm:mb-3">E</div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 sm:mb-2">Economic &amp; Social</h4>
              <p className="text-xs text-gray-600 leading-tight hidden sm:block">Your real life: income, access, cultural preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8 bg-gray-900 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-r from-amber-700/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-gradient-to-l from-teal-600/10 to-transparent rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4 sm:mb-6">
            Ready to eat with intention?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join thousands of Kenyans using real local food data and clinical assessment tools.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 py-4 sm:py-5 bg-amber-700 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold hover:bg-amber-800 transition-all hover:-translate-y-1 shadow-2xl shadow-amber-700/30"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 md:px-8 bg-gray-800 text-center">
        <div className="font-['DM_Serif_Display'] text-lg sm:text-xl text-amber-700 mb-2 sm:mb-3">ABCDE Nutrition</div>
        <p className="text-xs sm:text-sm text-gray-500">&copy; 2026 ABCDE Nutrition. All rights reserved.</p>
      </footer>

      {/* PUBLIC CONSULTATION MODAL */}
      {showConsultModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Book a Consultation</h2>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-3xl text-slate-300 hover:text-slate-500 leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <form onSubmit={handleSubmitConsultation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:border-amber-300 focus:outline-none text-base"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:border-amber-300 focus:outline-none text-base"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:border-amber-300 focus:outline-none text-base"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:border-amber-300 focus:outline-none text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                    <input
                      type="time"
                      name="preferred_time"
                      value={formData.preferred_time}
                      onChange={handleChange}
                      className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:border-amber-300 focus:outline-none text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Questions</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-5 py-4 border border-slate-200 rounded-3xl focus:border-amber-300 focus:outline-none text-base resize-none"
                    placeholder="Any specific concerns or questions..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-lg rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Consultation Request'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;