/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { X, Info, Plus, FileDown, ChevronRight, BookOpen, Utensils, Crown } from 'lucide-react';
import { generateNutritionReport } from '@/services/pdfService';
import { SubscriptionTier } from '../../../constants/subscriptionTier';
import { useAuth } from '../../../auth/authtoken';

const Dashboard = ({ 
  user: propUser, 
  anthroData: propAnthroData, 
  logs: propLogs, 
  onNavigate, 
  allUsers: propAllUsers, 
  loadAllUsers, 
  logout 
}) => {
  const { token, apiBaseURL } = useAuth();
  
  const [status, setStatus] = useState('idle');
  const [showBMRInfo, setShowBMRInfo] = useState(false);
  const [anthroData, setAnthroData] = useState(propAnthroData || null);
  const [logs, setLogs] = useState(propLogs || []);
  const [loading, setLoading] = useState(true);

  // Local tier state (syncs with parent + profile API)
  const [userTier, setUserTier] = useState(propUser?.tier || SubscriptionTier.PREMIUM);

  // Sync with parent props when upgraded
  useEffect(() => {
    if (propUser?.tier) {
      setUserTier(propUser.tier);
    }
  }, [propUser?.tier]);

  const user = propUser || {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    tier: SubscriptionTier.PREMIUM,
    joinDate: new Date().toISOString()
  };

  const allUsers = propAllUsers || [];

  // Modern subscription badge config
  const tierConfig = {
    [SubscriptionTier.FREE]: {
      label: 'FREE',
      className: 'bg-white/90 text-slate-700 border border-white/60 shadow-sm'
    },
    [SubscriptionTier.PRO_LITE]: {
      label: 'PRO LITE',
      className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/50'
    },
    [SubscriptionTier.PREMIUM]: {
      label: 'PREMIUM',
      className: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg border border-emerald-400/50'
    }
  };

  const currentTierConfig = tierConfig[userTier] || tierConfig[SubscriptionTier.FREE];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseURL}/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();

          setAnthroData({
            weightKg: data.weight_kg || 70,
            heightCm: data.height_cm || 175,
            age: data.age || 28,
            sex: data.sex || 'male',
            waistCircumference: data.waist_cm || 82,
            lastUpdated: new Date().toISOString()
          });

          const fetchedTier = data.tier || data.subscription_tier || data.subscriptionTier;
          if (fetchedTier) {
            setUserTier(fetchedTier);
          }
        } else if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLogs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseURL}/food-logs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);

        const rawData = await res.json();
        const data = Array.isArray(rawData) ? rawData : (rawData.results || []);

        const normalized = data.map(log => ({
          ...log,
          id: log.id,
          foodName: log.food_name || log.foodName,
          mealType: log.meal_type || log.mealType,
          grams: log.grams,
          nutrients: log.nutrients,
          date: log.date || new Date().toISOString()
        }));

        setLogs(normalized);
      } catch (err) {
        console.error('Fetch logs error:', err);
      }
    };

    fetchProfile();
    fetchLogs();

    if (loadAllUsers) {
      loadAllUsers().catch(console.error);
    }
  }, [token, apiBaseURL, loadAllUsers]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getBMI = () => {
    if (!anthroData) return null;
    const weight = Number(anthroData.weightKg);
    const height = Number(anthroData.heightCm) / 100;
    const bmi = weight / (height * height);
    let category = 'Normal';
    let color = 'emerald';
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'blue';
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = 'amber';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = 'red';
    }
    return { score: bmi.toFixed(1), category, color };
  };

  const getBMR = () => {
    if (!anthroData) return null;
    const weight = Number(anthroData.weightKg);
    const height = Number(anthroData.heightCm);
    const age = Number(anthroData.age);
    const sex = anthroData.sex;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (sex === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    return Math.round(bmr);
  };

  const bmi = getBMI();
  const bmr = getBMR();

  const dailyCalories = logs.reduce((sum, log) => {
    return sum + Number(log.nutrients?.calories || 0);
  }, 0);

  const bmiColorClasses = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  const bmiGradientStyles = {
    emerald: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
    blue: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    amber: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
    red: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
  };

  const handlePdfDownload = async () => {
    if (userTier !== SubscriptionTier.PREMIUM) {
      if (onNavigate) onNavigate('settings');
      else alert('Upgrade to Premium to download reports');
      return;
    }

    setStatus('generating');
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      generateNutritionReport(user, anthroData, logs);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleNavigate = (view) => {
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(view);
    } else {
      const routes = {
        dietlog: '/diet-log#/user/DietLog',
        plan:'/#/user/userPlan'
      };
      const path = routes[view] || '/';
      window.location.href = path;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome & Global Status - MODERN HEADER WITH SUBSCRIPTION BADGE */}
      <section className="flex flex-col md:flex-row md:items-end bg-amber-600 p-6 rounded-3xl justify-between gap-6 transition-all duration-500 hover:translate-y-[-2px] shadow-xl">
        <div className="transition-all duration-500">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight transition-all duration-300 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-500">
            Karibu Tena,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              {user.name.split(' ')[0]}
            </span>
          </h2>
          <p className="text-white/90 font-medium text-sm lg:text-base mt-1 transition-colors duration-300">
            Your premium dietary health monitoring center.
          </p>
        </div>

        {/* Right side - Modern Subscription Badge + Logout */}
        <div className="flex items-center gap-3">
          {/* Modern Subscription Badge */}
          <div className={`px-5 py-2.5 rounded-3xl text-xs font-black uppercase tracking-[0.12em] flex items-center gap-2 transition-all duration-300 hover:scale-105 ${currentTierConfig.className}`}>
            {userTier === SubscriptionTier.PREMIUM && <Crown className="w-4 h-4" />}
            {currentTierConfig.label}
          </div>

          {logout && (
            <button
              onClick={logout}
              className="px-5 py-2.5 text-sm font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/50 rounded-3xl transition-all duration-300 hover:bg-white/10"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Status indicator (kept as-is) */}
        {status !== 'idle' && (
          <div
            className={`px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 animate-pulse fixed top-20 right-4 lg:static z-[60] border border-white/20 transition-all duration-300 ${
              status === 'generating'
                ? 'bg-indigo-600/90 text-white shadow-indigo-200/50'
                : status === 'success'
                ? 'bg-emerald-600/90 text-white shadow-emerald-200/50'
                : 'bg-red-600/90 text-white shadow-red-200/50'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">
              {status === 'generating'
                ? 'Generating Report'
                : status === 'success'
                ? 'PDF Ready'
                : 'Export Error'}
            </span>
          </div>
        )}
      </section>

      {/* BMR Info Modal (unchanged) */}
      {showBMRInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowBMRInfo(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBMRInfo(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-800 mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              1. The Most Accurate Formula: Mifflin-St Jeor
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              This is generally considered the most reliable formula for modern lifestyles.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-4 mb-6">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">For Men</p>
                <code className="block bg-white border border-slate-200 p-3 rounded-lg text-xs font-mono text-slate-700 shadow-sm overflow-x-auto">
                  (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
                </code>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">For Women</p>
                <code className="block bg-white border border-slate-200 p-3 rounded-lg text-xs font-mono text-slate-700 shadow-sm overflow-x-auto">
                  (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161
                </code>
              </div>
            </div>
            <div className="flex gap-3 text-[10px] items-center text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Info className="w-5 h-5 shrink-0" />
              <p>Your BMR represents the number of calories your body burns at complete rest to maintain basic life functions.</p>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the dashboard (unchanged from previous version) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">
        {/* Metric Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
          {/* BMI Card */}
          <div className="bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-amber-500/50 relative overflow-hidden group hover:shadow-[0_30px_60px_rgba(16,185,129,0.1)] transition-all duration-500 transform hover:-translate-y-2 hover:border-emerald-200/50">
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] opacity-60 transition-all duration-500 group-hover:scale-125"
              style={{
                background: bmi
                  ? bmiGradientStyles[bmi.color]
                  : bmiGradientStyles.emerald,
              }}
            />
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors duration-300 group-hover:text-slate-600">
              Anthropometric (BMI)
            </span>
            {bmi ? (
              <div className="mt-6 flex items-end gap-4 relative z-10 transition-all duration-300">
                <p className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-600 tracking-tighter transition-all duration-300 group-hover:scale-105 origin-left">
                  {bmi.score}
                </p>
                <div className="mb-2 transition-all duration-300">
                  <p
                    className={`text-sm lg:text-base font-bold leading-none transition-all duration-300 group-hover:text-opacity-80 ${bmiColorClasses[bmi.color]}`}
                  >
                    {bmi.category}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 transition-colors duration-300 group-hover:text-slate-600">
                    kg/m²
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 relative z-10 transition-all duration-300">
                <button
                  onClick={() => handleNavigate('moduleA')}
                  className="w-full lg:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3 rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:shadow-emerald-400 hover:scale-105 transition-all duration-300 hover:-translate-y-0.5"
                >
                  COMPLETE PROFILE
                </button>
              </div>
            )}
          </div>

          {/* Caloric Intake Card */}
          <div className="bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-green/50 relative overflow-hidden group hover:shadow-[0_30px_60px_rgba(59,130,246,0.1)] transition-all duration-500 transform hover:-translate-y-2 hover:border-blue-200/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-[4rem] opacity-60 transition-all duration-500 group-hover:scale-125" />
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors duration-300 group-hover:text-slate-600">
              Caloric Intake
            </span>
            <div className="mt-6 flex items-end gap-4 relative z-10 transition-all duration-300">
              <p className="text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter transition-all duration-300 group-hover:scale-105 group-hover:text-slate-900 origin-left">
                {dailyCalories.toFixed(0)}
              </p>
              <div className="mb-2 transition-all duration-300">
                <p className="text-sm lg:text-base font-bold text-slate-600 leading-none transition-all duration-300 group-hover:text-slate-700">
                  kCal Today
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 transition-colors duration-300 group-hover:text-slate-600">
                  Daily Avg: 2,150
                </p>
              </div>
            </div>
          </div>

          {/* BMR Card */}
          <div className="bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-red/50 relative overflow-hidden group hover:shadow-[0_30px_60px_rgba(249,115,22,0.1)] transition-all duration-500 transform hover:-translate-y-2 hover:border-orange-200/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-50 rounded-bl-[4rem] opacity-60 transition-all duration-500 group-hover:scale-125" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-slate-600">
                Basal Metabolic Rate
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBMRInfo(true);
                }}
                className="w-6 h-6 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
                title="View Formula"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-6 flex items-end gap-4 relative z-10 transition-all duration-300">
              <p className="text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter transition-all duration-300 group-hover:scale-105 group-hover:text-slate-900 origin-left">
                {bmr || '--'}
              </p>
              <div className="mb-2 transition-all duration-300">
                <p className="text-sm lg:text-base font-bold text-slate-600 leading-none transition-all duration-300 group-hover:text-slate-700">
                  kCal/Day
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 transition-colors duration-300 group-hover:text-slate-600">
                  Resting Energy
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8">
            <button
              onClick={() => handleNavigate('dietlog')}
              className="group bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-6 lg:p-8 rounded-[2rem] flex items-center lg:flex-col lg:justify-between lg:items-start transition-all duration-500 shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_30px_50px_rgba(16,185,129,0.4)] hover:-translate-y-2 min-h-[100px] lg:h-56 text-left gap-4 relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
              <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl group-hover:rotate-12 transition-all duration-500 shrink-0 shadow-inner group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <div className="relative z-10 transition-all duration-300">
                <p className="text-white text-xl lg:text-2xl font-black leading-tight tracking-tight transition-all duration-300 group-hover:text-emerald-50">
                  Log New Food
                </p>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest opacity-90 mt-1 transition-opacity duration-300 group-hover:opacity-100">
                  KFCT Assessment
                </p>
              </div>
              <ChevronRight className="ml-auto lg:hidden w-6 h-6 text-white/50 transition-all duration-300 group-hover:translate-x-1" />
            </button>

            <button
              onClick={handlePdfDownload}
              disabled={status === 'generating'}
              className={`p-6 lg:p-8 rounded-[2rem] flex items-center lg:flex-col lg:justify-between lg:items-start transition-all duration-500 min-h-[100px] lg:h-56 text-left border gap-4 relative overflow-hidden group ${
                userTier === SubscriptionTier.PREMIUM
                  ? 'bg-white/80 backdrop-blur-xl border-indigo-100 hover:border-indigo-300 text-indigo-900 hover:bg-white shadow-[0_20px_40px_rgba(99,102,241,0.1)] hover:shadow-[0_30px_50px_rgba(99,102,241,0.2)] hover:-translate-y-2'
                  : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-80'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  userTier === SubscriptionTier.PREMIUM
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {status === 'generating' ? (
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                )}
              </div>
              <div className="transition-all duration-300">
                <p className="text-lg lg:text-2xl font-black leading-tight tracking-tight transition-colors duration-300 group-hover:text-indigo-600">
                  90-Day Nutrition Report
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors duration-300 ${
                    userTier === SubscriptionTier.PREMIUM
                      ? 'text-indigo-400 group-hover:text-indigo-600'
                      : 'text-slate-400'
                  }`}
                >
                  Premium PDF Export
                </p>
              </div>
              <ChevronRight className="ml-auto lg:hidden w-6 h-6 opacity-30 transition-all duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Recent Activity / History Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col h-full overflow-hidden hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:border-emerald-200/50 transition-all duration-500 hover:-translate-y-1">
          <div className="p-6 border-b border-slate-100/50 flex justify-between items-center bg-white/40 transition-all duration-300 group hover:bg-white/60">
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] transition-colors duration-300">
              Recent Activity
            </h3>
            <button
              onClick={() => handleNavigate('dietlog')}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-2 transition-all duration-300 hover:scale-110"
            >
              VIEW FULL HISTORY
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px] lg:min-h-0 custom-scrollbar">
            {logs.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {logs
                  .slice(-5)
                  .reverse()
                  .map((log, idx) => (
                    <div
                      key={log.id}
                      className="p-5 hover:bg-white/60 transition-all duration-300 flex items-center gap-4 group animate-in fade-in slide-in-from-left-4 duration-500"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 group-hover:scale-125 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:rotate-6">
                        <BookOpen className="w-6 h-6 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0 transition-all duration-300">
                        <p className="font-extrabold text-slate-800 text-sm truncate transition-colors duration-300 group-hover:text-emerald-700">
                          {log.foodName}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5 transition-colors duration-300 group-hover:text-slate-600">
                          {log.mealType} •{' '}
                          <span className="text-emerald-600 transition-colors duration-300 group-hover:text-emerald-700">
                            {log.grams}g
                          </span>
                        </p>
                      </div>
                      <div className="text-right shrink-0 transition-all duration-300">
                        <p className="font-black text-slate-700 text-sm transition-colors duration-300 group-hover:text-emerald-700">
                          {Number(log.nutrients?.calories || 0).toFixed(0)}
                        </p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider transition-colors duration-300 group-hover:text-slate-600">
                          kCal
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 transition-all duration-500 hover:opacity-80">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200 shadow-inner transition-transform duration-300 hover:scale-110">
                  <Utensils className="w-10 h-10" />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest transition-colors duration-300">
                  Diary is empty
                </p>
                <button
                  onClick={() => handleNavigate('DietLog')}
                  className="mt-4 text-emerald-600 text-xs font-bold hover:underline transition-all duration-300 hover:text-emerald-700 hover:scale-105"
                >
                  Start Logging
                </button>
              </div>
            )}
          </div>

          {userTier === SubscriptionTier.FREE && (
            <div className="p-6 bg-slate-50/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-100/50">
              <button
                onClick={() => handleNavigate('plan')}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white text-[10px] font-black py-4 rounded-2xl tracking-[0.2em] uppercase hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 hover:scale-105"
              >
                Upgrade to Pro Lite
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;