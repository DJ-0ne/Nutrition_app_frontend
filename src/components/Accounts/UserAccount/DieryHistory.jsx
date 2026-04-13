/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../auth/useAuth';

const ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9, 1.9];
const ACTIVITY_LABELS = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active', 'Athlete'];

const DietHistory = () => {
    const { token, apiBaseURL } = useAuth();
    const [logs, setLogs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [periodIndex, setPeriodIndex] = useState(0); // renamed from interval

    const fetchLogs = async () => {
        if (!token) { setLogs([]); return; }
        try {
            const res = await fetch(`${apiBaseURL}/food-logs/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
            const rawData = await res.json();
            const data = Array.isArray(rawData) ? rawData : (rawData.results || []);
            setLogs(data.map(log => ({
                ...log,
                foodName: log.food_name || log.foodName,
                portionName: log.portion_name || log.portionName,
                mealType: log.meal_type || log.mealType,
            })));
        } catch (err) {
            console.error('Fetch logs error:', err);
            setLogs([]);
        }
    };

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${apiBaseURL}/profile/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setProfile(await res.json());
        } catch (err) {
            console.error('Fetch profile error:', err);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchProfile();
    }, [token]);

    // Dynamic TDEE — uses Schofield for <20, revised Harris-Benedict for >=20
    const tdee = useMemo(() => {
        if (!profile) return null;
        const { weight_kg: w, height_cm: h, age: a, sex, activity_level } = profile;
        if (!w || !a || !sex || activity_level == null) return null;

        let bmr;
        if (a >= 20) {
            if (!h) return null; // height required for adults
            bmr = sex === 'male'
                ? 13.397 * w + 4.799 * h - 5.677 * a + 88.362
                : 9.247 * w + 3.098 * h - 4.330 * a + 447.593;
        } else if (a >= 18) {
            bmr = sex === 'male' ? 15.057 * w + 692.2 : 14.818 * w + 486.6;
        } else if (a >= 10) {
            bmr = sex === 'male' ? 17.686 * w + 658.2 : 13.384 * w + 692.6;
        } else if (a >= 3) {
            bmr = sex === 'male' ? 22.706 * w + 504.3 : 20.315 * w + 485.9;
        } else {
            bmr = sex === 'male' ? 59.512 * w - 30.4 : 58.317 * w - 31.1;
        }

        if (!bmr || isNaN(bmr)) return null;
        return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity_level] ?? 1.2));
    }, [profile]);

    // Dynamic thresholds: ±20% of TDEE, or sensible age/sex-based fallbacks
    const { lowThreshold, highThreshold, thresholdSource } = useMemo(() => {
        if (tdee) {
            return {
                lowThreshold: Math.round(tdee * 0.8),
                highThreshold: Math.round(tdee * 1.2),
                thresholdSource: 'tdee'
            };
        }
        // Fallback when profile is incomplete — use WHO/DRI reference averages by sex
        if (profile?.sex === 'male') {
            return { lowThreshold: 1700, highThreshold: 2500, thresholdSource: 'fallback' };
        }
        if (profile?.sex === 'female') {
            return { lowThreshold: 1400, highThreshold: 2000, thresholdSource: 'fallback' };
        }
        // Generic fallback when no profile at all
        return { lowThreshold: 1200, highThreshold: 2400, thresholdSource: 'fallback' };
    }, [tdee, profile]);

    const historyData = useMemo(() => {
        const dailyCalories = new Map();
        logs.forEach(log => {
            const dateStr = new Date(log.date).toISOString().split('T')[0];
            dailyCalories.set(dateStr, (dailyCalories.get(dateStr) || 0) + (log.nutrients?.calories || 0));
        });
        return Array.from({ length: 90 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            return { date: d, dateStr, calories: dailyCalories.get(dateStr) || 0 };
        });
    }, [logs]);

    const activeData = useMemo(() => {
        const start = periodIndex * 30;
        return [...historyData.slice(start, start + 30)].reverse();
    }, [historyData, periodIndex]);

    const daysWithData = useMemo(() => activeData.filter(d => d.calories > 0), [activeData]);

    const averageCalories = useMemo(() => {
        if (daysWithData.length === 0) return 0;
        return Math.round(daysWithData.reduce((acc, d) => acc + d.calories, 0) / daysWithData.length);
    }, [daysWithData]);

    const gridItems = useMemo(() => {
        if (activeData.length === 0) return [];
        const blanks = Array.from({ length: activeData[0].date.getDay() }, (_, i) => ({ blank: true, key: `blank-${i}` }));
        return [...blanks, ...activeData];
    }, [activeData]);

    const getIntensityStyle = (calories) => {
        if (calories === 0) return {
            bg: 'bg-slate-100', border: 'border-slate-200',
            shadow: 'hover:shadow-md hover:border-slate-300'
        };
        if (calories > highThreshold) return {
            bg: 'bg-gradient-to-br from-red-500 to-rose-600', border: 'border-red-400',
            shadow: 'hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-0.5'
        };
        if (calories >= lowThreshold) return {
            bg: 'bg-gradient-to-br from-green-500 to-green-600', border: 'border-green-400',
            shadow: 'hover:shadow-xl hover:shadow-green-200/50 hover:-translate-y-0.5'
        };
        return {
            bg: 'bg-gradient-to-br from-amber-500 to-red-500', border: 'border-amber-400',
            shadow: 'hover:shadow-xl hover:shadow-amber-200/50 hover:-translate-y-0.5'
        };
    };

    // Comparison: average vs TDEE
    const calorieStatus = useMemo(() => {
        if (!tdee || averageCalories === 0) return null;
        const diff = averageCalories - tdee;
        const pct = Math.round(Math.abs(diff) / tdee * 100);
        if (Math.abs(diff) < tdee * 0.05) return { label: 'On Target', color: 'text-green-600', pct };
        return diff > 0
            ? { label: `${pct}% Over TDEE`, color: 'text-red-500', pct }
            : { label: `${pct}% Under TDEE`, color: 'text-amber-500', pct };
    }, [averageCalories, tdee]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30">
            <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="w-full space-y-4 sm:space-y-6 md:space-y-8">

                    {/* Header */}
                    <div className="w-full bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 lg:p-8 shadow-xl border border-amber-100">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-5 md:gap-6">
                            <div className="space-y-1 sm:space-y-2">
                                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-800">
                                    30-Day
                                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent block sm:inline sm:ml-2">
                                        Nutrition History
                                    </span>
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-base md:text-lg font-medium">
                                    Track your long-term caloric patterns and trends
                                </p>
                                {/* Dynamic TDEE context line */}
                                {tdee ? (
                                    <p className="text-[10px] sm:text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 sm:px-3 py-1 rounded-full inline-block mt-1">
                                        Your TDEE: {tdee.toLocaleString()} kcal
                                        {profile?.activity_level != null && (
                                            <span className="text-amber-500 ml-1">
                                                · {ACTIVITY_LABELS[profile.activity_level]} (×{ACTIVITY_MULTIPLIERS[profile.activity_level]})
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-medium italic mt-1">
                                        {thresholdSource === 'fallback'
                                            ? '⚠ Complete your health profile for personalized thresholds'
                                            : 'Loading profile…'}
                                    </p>
                                )}
                            </div>

                            <div className="w-full xl:w-auto space-y-3 sm:space-y-4">
                                {/* Period Toggles */}
                                <div className="bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row flex-wrap gap-1 w-full">
                                    {['Last 30', '30–60 Days', '60–90 Days'].map((label, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPeriodIndex(idx)}
                                            className={`
                                                flex-1 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl
                                                text-xs sm:text-sm md:text-base font-bold transition-all duration-300 whitespace-nowrap
                                                ${periodIndex === idx
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                                                    : 'bg-white/50 text-slate-600 hover:bg-white hover:text-amber-600'}
                                            `}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Average Card */}
                                <div className="w-full bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xl">
                                    <p className="text-amber-50 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                                        30-Day Average
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-xl sm:text-3xl md:text-4xl font-black text-white">
                                            {averageCalories > 0 ? averageCalories.toLocaleString() : '---'}
                                        </span>
                                        <span className="text-amber-100 text-xs sm:text-base font-bold mb-1">kcal</span>
                                    </div>
                                    <p className="text-amber-100 text-[10px] sm:text-xs mt-1 font-medium">
                                        Based on {daysWithData.length} logged days
                                    </p>
                                    {/* Live vs TDEE status */}
                                    {calorieStatus && (
                                        <p className={`text-[10px] sm:text-xs font-bold mt-1 text-white ${calorieStatus.color} bg-white/20 rounded-full px-2 py-0.5 inline-block`}>
                                            {calorieStatus.label}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="w-full bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-5 lg:p-6 shadow-2xl border border-amber-100">
                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center">
                                    <span className="text-[10px] sm:text-sm md:text-base font-bold text-slate-500">{day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
                            {gridItems.map((item, idx) => {
                                if (item.blank) return (
                                    <div key={item.key} className="aspect-square rounded-md sm:rounded-lg md:rounded-xl bg-slate-50 border border-slate-200" />
                                );
                                const style = getIntensityStyle(item.calories);
                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            aspect-square rounded-md sm:rounded-lg md:rounded-xl flex flex-col items-center justify-center
                                            border-2 cursor-pointer group relative transition-all duration-300
                                            ${style.bg} ${style.border} ${style.shadow} p-0.5 sm:p-1
                                        `}
                                    >
                                        <span className={`text-[10px] sm:text-sm md:text-base lg:text-lg font-black ${item.calories > 0 ? 'text-white' : 'text-slate-500'}`}>
                                            {item.date.getDate()}
                                        </span>
                                        {item.calories > 0 && (
                                            <span className="text-[7px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-white/90">
                                                {(item.calories / 1000).toFixed(1)}k
                                            </span>
                                        )}
                                        {/* Tooltip */}
                                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0 shadow-2xl z-50 min-w-[110px] sm:min-w-[170px]">
                                            <div className="text-center">
                                                <p className="text-[7px] sm:text-xs text-slate-400 font-medium mb-0.5 sm:mb-1">
                                                    {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] sm:text-base lg:text-lg font-black text-white">
                                                    {item.calories.toLocaleString()}
                                                    <span className="text-[7px] sm:text-xs text-slate-300 ml-1">kcal</span>
                                                </p>
                                                {tdee && item.calories > 0 && (
                                                    <p className={`text-[7px] sm:text-[10px] font-bold mt-0.5 ${
                                                        item.calories > highThreshold ? 'text-red-300'
                                                        : item.calories >= lowThreshold ? 'text-green-300'
                                                        : 'text-amber-300'
                                                    }`}>
                                                        {item.calories > highThreshold ? `+${(item.calories - tdee).toLocaleString()} over TDEE`
                                                        : item.calories >= lowThreshold ? 'Within target'
                                                        : `${(tdee - item.calories).toLocaleString()} under TDEE`}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 sm:border-8 border-transparent border-t-slate-900" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dynamic Legend */}
                        <div className="w-full mt-4 sm:mt-5 md:mt-6 flex flex-col gap-3 sm:flex-wrap sm:gap-3 md:gap-4 justify-start p-2 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                            {[
                                {
                                    label: 'Optimal',
                                    range: `${lowThreshold.toLocaleString()}–${highThreshold.toLocaleString()} kcal`,
                                    sub: tdee ? `TDEE ±20%` : 'Reference range',
                                    color: 'from-green-500 to-green-600'
                                },
                                {
                                    label: 'Low',
                                    range: `< ${lowThreshold.toLocaleString()} kcal`,
                                    sub: tdee ? `< 80% TDEE` : 'Below minimum',
                                    color: 'from-amber-500 to-red-500'
                                },
                                {
                                    label: 'High',
                                    range: `> ${highThreshold.toLocaleString()} kcal`,
                                    sub: tdee ? `> 120% TDEE` : 'Above maximum',
                                    color: 'from-red-500 to-rose-600'
                                },
                            ].map(({ label, range, sub, color }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md bg-gradient-to-br ${color} shadow-md`} />
                                    <div>
                                        <span className="text-[11px] sm:text-sm font-bold text-slate-800">{label}</span>
                                        <span className="text-[11px] sm:text-xs text-slate-500 ml-1">({range})</span>
                                        <span className="hidden md:inline text-[10px] text-slate-400 ml-1">· {sub}</span>
                                    </div>
                                </div>
                            ))}
                            {thresholdSource === 'fallback' && (
                                <p className="w-full text-[10px] text-amber-600 font-semibold mt-1">
                                    Showing reference thresholds. Complete your health profile for personalized ranges.
                                </p>
                            )}
                        </div>

                        {/* Summary Stats */}
                        <div className="w-full mt-4 sm:mt-5 md:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            {[
                                { label: 'Total Days', value: activeData.length },
                                { label: 'Logged', value: daysWithData.length },
                                {
                                    label: 'Highest',
                                    value: daysWithData.length > 0
                                        ? Math.max(...daysWithData.map(d => d.calories)).toLocaleString()
                                        : '---'
                                },
                                {
                                    label: 'Lowest',
                                    value: daysWithData.length > 0
                                        ? Math.min(...daysWithData.map(d => d.calories)).toLocaleString()
                                        : '---'
                                },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-amber-50 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                                    <p className="text-[9px] sm:text-xs text-amber-600 font-bold uppercase mb-1">{label}</p>
                                    <p className="text-base sm:text-xl md:text-2xl font-black text-slate-800">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietHistory;