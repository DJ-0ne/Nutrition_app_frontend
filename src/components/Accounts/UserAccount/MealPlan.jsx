import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { MEAL_TYPES } from '../../../constants/mealTypes';
import { SubscriptionTier } from '../../../constants/subscriptionTier';
import { useAuth } from '../../../auth/useAuth';

const MealPlan = ({ userTier: propUserTier = SubscriptionTier.PREMIUM }) => {
  const { token, apiBaseURL } = useAuth();

  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState(propUserTier);

  useEffect(() => {
    if (propUserTier) setCurrentTier(propUserTier);
  }, [propUserTier]);

  useEffect(() => {
    const fetchTier = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseURL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const tier = data.tier || data.subscription_tier || data.subscriptionTier;
          if (tier) setCurrentTier(tier);
        }
      } catch (e) {
        console.warn('Could not fetch tier');
      }
    };
    fetchTier();
  }, [token, apiBaseURL]);

  const loadMealPlan = async () => {
    if (token) {
      try {
        const res = await fetch(`${apiBaseURL}/meal-plan/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.meal_plan) {
            setMealPlan(data.meal_plan);
            localStorage.setItem('generatedMealPlan', JSON.stringify(data.meal_plan));
            return;
          }
        }
      } catch (err) {
        console.warn('Server meal plan fetch failed, using localStorage');
      }
    }

    const savedPlan = localStorage.getItem('generatedMealPlan');
    if (savedPlan) {
      try {
        setMealPlan(JSON.parse(savedPlan));
      } catch (e) {
        localStorage.removeItem('generatedMealPlan');
        setMealPlan(null);
      }
    } else {
      setMealPlan(null);
    }
  };

  useEffect(() => {
    loadMealPlan();
  }, [token]);

  const saveMealPlan = async (plan) => {
    localStorage.setItem('generatedMealPlan', JSON.stringify(plan));

    if (!token) return;

    try {
      await fetch(`${apiBaseURL}/save-meal-plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meal_plan: plan }),
      });
    } catch (err) {
      console.warn('Saved only locally (server save failed)');
    }
  };

  const generateMealPlan = async () => {
    if (currentTier === SubscriptionTier.FREE) {
      toast.error('Upgrade to generate personalized meal plans');
      return;
    }

    if (!token) {
      toast.error('Please log in to generate meal plans');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseURL}/generate-meal-plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate meal plan');
      }

      const data = await res.json();
      const newPlan = data.meal_plan;

      setMealPlan(newPlan);
      await saveMealPlan(newPlan);

      toast.success('New meal plan generated & saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error generating meal plan');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-20 lg:pb-10">
        <div className="w-full space-y-6 sm:space-y-8">
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-amber-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
              <div className="space-y-2 lg:space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-800">
                  7-Day 
                  <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Meal Plan
                  </span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-3xl leading-relaxed font-medium">
                  Your personalized weekly nutrition schedule, designed to meet your dietary goals.
                </p>
              </div>

              <div className={`px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border-2 ${
                currentTier === SubscriptionTier.FREE 
                  ? 'bg-slate-100 text-slate-600 border-slate-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {currentTier === SubscriptionTier.FREE ? (
                  <span>Free Tier • Upgrade for Advanced Plans</span>
                ) : (
                  <span>Premium Active • Advanced Plans</span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="p-4 sm:p-5 text-left text-xs font-bold text-amber-700 uppercase tracking-wider sticky left-0 bg-amber-50 z-20 w-36 border-b border-amber-200">
                      Meal Time
                    </th>
                    {days.map(day => (
                      <th key={day} className="p-4 sm:p-5 text-center text-xs font-bold text-amber-700 uppercase tracking-wider min-w-[130px] border-b border-amber-200">
                        {day.slice(0, 3)}
                        <span className="hidden sm:inline"> {day.slice(3)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {MEAL_TYPES.map((meal, index) => (
                    <tr key={meal.value} className="hover:bg-amber-50/50 transition-colors">
                      <td className={`p-4 sm:p-5 text-sm font-black sticky left-0 bg-white hover:bg-amber-50/50 z-10 border-r border-amber-100 transition-colors
                        ${index === 0 ? 'text-amber-600' : index === 2 ? 'text-orange-600' : index === 4 ? 'text-amber-700' : 'text-amber-500'}`}>
                        {meal.label}
                      </td>
                      {days.map((day) => (
                        <td key={`${day}-${meal.value}`} className="p-3 sm:p-4 text-center border-l border-amber-50 first:border-l-0">
                          <div className="min-h-[90px] bg-white rounded-lg border-2 border-amber-100 p-3 text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-center text-center hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30 transition-all">
                            {mealPlan && mealPlan[day]?.[meal.value] ? (
                              <span className="leading-relaxed">{mealPlan[day][meal.value]}</span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">No meal planned</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Layout */}
            <div className="sm:hidden divide-y divide-amber-100">
              {days.map((day, dayIndex) => (
                <div key={day} className="p-4">
                  <h3 className="text-lg font-bold text-amber-800 mb-4 border-b border-amber-200 pb-2">
                    {day}
                  </h3>
                  <div className="space-y-3">
                    {MEAL_TYPES.map((meal, mealIndex) => (
                      <div key={meal.value} className="bg-amber-50/50 rounded-lg p-3">
                        <p className={`text-sm font-bold mb-1 ${
                          mealIndex === 0 ? 'text-amber-600' : mealIndex === 2 ? 'text-orange-600' : mealIndex === 4 ? 'text-amber-700' : 'text-amber-500'
                        }`}>
                          {meal.label}
                        </p>
                        <p className="text-sm text-slate-700 font-medium">
                          {mealPlan && mealPlan[day]?.[meal.value] ? (
                            mealPlan[day][meal.value]
                          ) : (
                            <span className="text-slate-400 italic">No meal planned</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-200 bg-amber-50/50 p-4 flex flex-wrap gap-4 justify-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-medium text-slate-600">Breakfast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs font-medium text-slate-600">Lunch</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-700"></div>
                <span className="text-xs font-medium text-slate-600">Dinner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <span className="text-xs font-medium text-slate-600">Snacks</span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-40 bg-white shadow-2xl rounded-xl border-2 border-amber-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              

              <button 
                onClick={generateMealPlan}
                disabled={loading || currentTier === SubscriptionTier.FREE}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] ${
                  currentTier === SubscriptionTier.FREE
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Plan...</span>
                  </>
                ) : (
                  <>
                    <span>Generate New Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {currentTier === SubscriptionTier.FREE && (
            <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-800 text-lg font-bold mb-2">Upgrade to Generate Personalized Meal Plans</p>
              <p className="text-amber-600 mb-4">Get Advanced meal plans tailored to your dietary needs and goals.</p>
              <button className="bg-amber-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors">
                View Premium Features
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;