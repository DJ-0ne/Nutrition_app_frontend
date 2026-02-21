import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Mock constants since we don't have the actual imports
const MEAL_TYPES = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'morning_snack', label: 'Morning Snack' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'afternoon_snack', label: 'Afternoon Snack' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'evening_snack', label: 'Evening Snack' }
];

const SubscriptionTier = {
    FREE: 'free',
    PREMIUM: 'premium',
    PROFESSIONAL: 'professional'
};

// Mock auth hook
const useAuth = () => ({
    token: localStorage.getItem('token'),
    apiBaseURL: 'http://localhost:8000'
});

// Sample meal plan data for display when none exists
const sampleMealPlan = {
    'Monday': {
        'breakfast': 'Scrambled eggs with spinach and whole grain toast',
        'morning_snack': 'Apple with peanut butter',
        'lunch': 'Grilled chicken breast with quinoa and roasted vegetables',
        'afternoon_snack': 'Greek yogurt with berries',
        'dinner': 'Baked salmon with sweet potato and steamed broccoli',
        'evening_snack': 'Herbal tea'
    },
    'Tuesday': {
        'breakfast': 'Oatmeal with banana and honey',
        'morning_snack': 'Handful of almonds',
        'lunch': 'Lentil soup with whole grain bread',
        'afternoon_snack': 'Orange',
        'dinner': 'Beef stir-fry with mixed vegetables and brown rice',
        'evening_snack': 'Warm milk'
    },
    'Wednesday': {
        'breakfast': 'Smoothie bowl with granola',
        'morning_snack': 'Rice cake with avocado',
        'lunch': 'Tuna salad sandwich on whole wheat',
        'afternoon_snack': 'Carrot sticks with hummus',
        'dinner': 'Vegetable curry with chickpeas and naan',
        'evening_snack': 'Chamomile tea'
    },
    'Thursday': {
        'breakfast': 'Greek yogurt parfait with berries',
        'morning_snack': 'Banana',
        'lunch': 'Quinoa bowl with roasted vegetables and feta',
        'afternoon_snack': 'Hard-boiled egg',
        'dinner': 'Grilled fish with mashed potatoes and green beans',
        'evening_snack': 'Pear'
    },
    'Friday': {
        'breakfast': 'Whole grain pancakes with maple syrup',
        'morning_snack': 'Mixed nuts',
        'lunch': 'Chicken Caesar salad',
        'afternoon_snack': 'Apple slices',
        'dinner': 'Homemade pizza with vegetable toppings',
        'evening_snack': 'Peppermint tea'
    },
    'Saturday': {
        'breakfast': 'Avocado toast with poached eggs',
        'morning_snack': 'Smoothie',
        'lunch': 'Bean and cheese burrito',
        'afternoon_snack': 'Trail mix',
        'dinner': 'Roasted chicken with roasted potatoes and carrots',
        'evening_snack': 'Dark chocolate square'
    },
    'Sunday': {
        'breakfast': 'French toast with berries',
        'morning_snack': 'Yogurt',
        'lunch': 'Vegetable soup with crackers',
        'afternoon_snack': 'Celery sticks with peanut butter',
        'dinner': 'Pasta with marinara sauce and turkey meatballs',
        'evening_snack': 'Fruit tea'
    }
};

const MealPlan = ({ userTier = SubscriptionTier.PREMIUM }) => {
    const { token, apiBaseURL } = useAuth();
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Load saved meal plan from localStorage on mount
    useEffect(() => {
        const savedPlan = localStorage.getItem('generatedMealPlan');
        if (savedPlan) {
            try {
                setMealPlan(JSON.parse(savedPlan));
            } catch (e) {

                localStorage.removeItem('generatedMealPlan');
                return e;
            }
        } else {
            // Use sample data if no saved plan exists
            setMealPlan(sampleMealPlan);
        }
    }, []);

    const generateMealPlan = async () => {
        if (userTier === SubscriptionTier.FREE) {
            toast.error('Upgrade to generate personalized meal plans');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${apiBaseURL}/api/generate-meal-plan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to generate meal plan');
            }

            const data = await res.json();
            const newPlan = data.meal_plan || sampleMealPlan;

            setMealPlan(newPlan);
            localStorage.setItem('generatedMealPlan', JSON.stringify(newPlan));

            toast.success('New meal plan generated successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error generating meal plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="w-full space-y-6 sm:space-y-8">
                    {/* Header Section */}
                    <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="space-y-3">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800">
                                    7-Day 
                                    <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                        Meal Plan
                                    </span>
                                </h1>
                                <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                                    Your personalized weekly nutrition schedule, designed to meet your dietary goals.
                                </p>
                            </div>

                            {/* Subscription Badge */}
                            <div className="w-full lg:w-auto">
                                <div className={`
                                    px-5 py-3 rounded-xl font-bold text-sm border-2
                                    ${userTier === SubscriptionTier.FREE 
                                        ? 'bg-slate-100 text-slate-600 border-slate-300' 
                                        : 'bg-amber-50 text-amber-700 border-amber-300'
                                    }
                                `}>
                                    {userTier === SubscriptionTier.FREE ? (
                                        <span>Free Tier • Upgrade for AI Plans</span>
                                    ) : (
                                        <span>✨ Premium Active • AI-Powered Plans</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meal Plan Table */}
                    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
                        <div className="w-full overflow-x-auto">
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
                                            <td className={`
                                                p-4 sm:p-5 text-sm font-black sticky left-0 bg-white hover:bg-amber-50/50 z-10 border-r border-amber-100 transition-colors
                                                ${index === 0 ? 'text-amber-600' : 
                                                  index === 2 ? 'text-orange-600' : 
                                                  index === 4 ? 'text-amber-700' : 
                                                  'text-amber-500'}
                                            `}>
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

                        {/* Table Footer with Legend */}
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

                    {/* Action Bar */}
                    <div className="sticky bottom-4 z-40 bg-white shadow-2xl rounded-xl border-2 border-amber-200 p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Stats */}
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">Total Meals:</span>
                                    <span className="ml-2 font-bold text-amber-600">42</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Days Planned:</span>
                                    <span className="ml-2 font-bold text-amber-600">7</span>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button 
                                onClick={generateMealPlan}
                                disabled={loading || userTier === SubscriptionTier.FREE}
                                className={`
                                    px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base
                                    transition-all transform hover:scale-[1.02] active:scale-95
                                    flex items-center justify-center gap-2 min-w-[200px]
                                    ${userTier === SubscriptionTier.FREE
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-600'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Generating Plan...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Generate New AI Plan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Premium Upgrade Prompt for Free Users */}
                    {userTier === SubscriptionTier.FREE && (
                        <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                            <p className="text-amber-800 text-lg font-bold mb-2">Upgrade to Generate Personalized Meal Plans</p>
                            <p className="text-amber-600 mb-4">Get AI-powered meal plans tailored to your dietary needs and goals.</p>
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