/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../auth/useAuth';



const DietHistory = () => {
    const { token, apiBaseURL } = useAuth();
    const [logs, setLogs] = useState([]);
    const [interval, setInterval] = useState(0); // 0 = Days 1-30, 1 = Days 31-60, 2 = Days 61-90

    const fetchLogs = async () => {
        if (!token) {
          setLogs([]);
          return;
        }
        try {
          const res = await fetch(`${apiBaseURL}/api/food-logs/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (!res.ok) throw new Error(`Failed to fetch logs: ${res.status}`);
    
          const rawData = await res.json();
          const data = Array.isArray(rawData) ? rawData : (rawData.results || []);
    
          const normalized = data.map(log => ({
            ...log,
            foodName: log.food_name || log.foodName,
            portionName: log.portion_name || log.portionName,
            mealType: log.meal_type || log.mealType,
          }));
    
          setLogs(normalized);
        } catch (err) {
          console.error('Fetch logs error:', err);
          setLogs([]);
        }
      };
    
      useEffect(() => {
        fetchLogs();
      }, [token]);

    // Process logs to get last 90 days of real data
    const historyData = useMemo(() => {
        const dailyCalories = new Map();

        logs.forEach(log => {
            const dateStr = new Date(log.date).toISOString().split('T')[0];
            const current = dailyCalories.get(dateStr) || 0;
            dailyCalories.set(dateStr, current + (log.nutrients?.calories || 0));
        });

        // Generate 90 days reversed (Today -> 89 days ago)
        return Array.from({ length: 90 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            return {
                date: d,
                dateStr,
                calories: dailyCalories.get(dateStr) || 0
            };
        });
    }, [logs]);

    const activeData = useMemo(() => {
        const start = interval * 30;
        const end = start + 30;
        const slice = historyData.slice(start, end);
        return [...slice].reverse();
    }, [historyData, interval]);

    const daysWithData = useMemo(() => activeData.filter(d => d.calories > 0), [activeData]);

    const averageCalories = useMemo(() => {
        if (daysWithData.length === 0) return 0;
        const total = daysWithData.reduce((acc, d) => acc + d.calories, 0);
        return Math.round(total / daysWithData.length);
    }, [daysWithData]);

    const gridItems = useMemo(() => {
        if (activeData.length === 0) return [];
        const firstDay = activeData[0].date.getDay();
        const blanks = Array.from({ length: firstDay }, (_, i) => ({ blank: true, key: `blank-${i}` }));
        return [...blanks, ...activeData];
    }, [activeData]);

    // Get intensity color based on calories
    const getIntensityStyle = (calories) => {
        if (calories === 0) {
            return {
                bg: 'bg-slate-100',
                border: 'border-slate-200',
                text: 'text-slate-400',
                shadow: 'hover:shadow-md hover:border-slate-300'
            };
        }
        if (calories > 2400) {
            return {
                bg: 'bg-gradient-to-br from-red-500 to-rose-600',
                border: 'border-red-400',
                text: 'text-white',
                shadow: 'hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-0.5'
            };
        }
        if (calories >= 1200 && calories <= 2400  ) {
            return {
                bg: 'bg-gradient-to-br from-green-500 to-green-600',
                border: 'border-green-400',
                text: 'text-white',
                shadow: 'hover:shadow-xl hover:shadow-green-200/50 hover:-translate-y-0.5'
            };
        }

        if (calories < 1200) {
            return {
                bg: 'bg-gradient-to-br from-amber-500 to-red-500',
                border: 'border-amber-400',
                text: 'text-white',
                shadow: 'hover:shadow-xl hover:shadow-amber-200/50 hover:-translate-y-0.5'
            };
        }
        return {
            bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
            border: 'border-amber-400',
            text: 'text-white',
            shadow: 'hover:shadow-xl hover:shadow-amber-200/50 hover:-translate-y-0.5'
        };
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30">
            <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                <div className="w-full space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Header Section - Full width */}
                    <div className="w-full bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl border border-amber-100">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-5 md:gap-6">
                            {/* Title */}
                            <div className="space-y-1 sm:space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-800">
                                    30-Day 
                                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent block sm:inline sm:ml-2">
                                        Nutrition History
                                    </span>
                                </h1>
                                <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium">
                                    Track your long-term caloric patterns and trends
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="w-full xl:w-auto space-y-3 sm:space-y-4">
                                {/* Interval Toggles */}
                                <div className="bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex flex-wrap gap-1 w-full">
                                    {['Last 30', '30-60 Days', '60-90 Days'].map((label, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setInterval(idx)}
                                            className={`
                                                flex-1 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold
                                                transition-all duration-300 whitespace-nowrap
                                                ${interval === idx
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                                                    : 'bg-white/50 text-slate-600 hover:bg-white hover:text-amber-600'
                                                }
                                            `}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Average Card */}
                                <div className="w-full bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl">
                                    <p className="text-amber-50 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                                        30-Day Average
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                                            {averageCalories > 0 ? averageCalories.toLocaleString() : '---'}
                                        </span>
                                        <span className="text-amber-100 text-sm sm:text-base font-bold mb-1">kcal</span>
                                    </div>
                                    <p className="text-amber-100 text-[10px] sm:text-xs mt-1 font-medium">
                                        Based on {daysWithData.length} logged days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid - Full width */}
                    <div className="w-full bg-white rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl border border-amber-100">
                        {/* Day Labels */}
                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center">
                                    <span className="text-xs sm:text-sm md:text-base font-bold text-slate-500">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Calendar Cells */}
                        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
                            {gridItems.map((item, idx) => {
                                if (item.blank) {
                                    return (
                                        <div 
                                            key={item.key} 
                                            className="aspect-square rounded-md sm:rounded-lg md:rounded-xl bg-slate-50 border border-slate-200"
                                        ></div>
                                    );
                                }

                                const day = item;
                                const style = getIntensityStyle(day.calories);

                                return (
                                    <div
                                        key={idx}
                                        className={`
                                            aspect-square rounded-md sm:rounded-lg md:rounded-xl flex flex-col items-center justify-center
                                            border-2 cursor-pointer group relative
                                            transition-all duration-300
                                            ${style.bg} ${style.border} ${style.shadow}
                                            p-0.5 sm:p-1
                                        `}
                                    >
                                        {/* Date number */}
                                        <span className={`
                                            text-xs sm:text-sm md:text-base lg:text-lg font-black
                                            ${day.calories > 0 ? 'text-white' : 'text-slate-500'}
                                        `}>
                                            {day.date.getDate()}
                                        </span>
                                        
                                        {/* Calorie indicator */}
                                        {day.calories > 0 && (
                                            <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold text-white/90">
                                                {(day.calories / 1000).toFixed(1)}k
                                            </span>
                                        )}

                                        {/* Tooltip */}
                                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0 shadow-2xl z-50 min-w-[120px] sm:min-w-[160px]">
                                            <div className="text-center">
                                                <p className="text-[8px] sm:text-xs text-slate-400 font-medium mb-0.5 sm:mb-1">
                                                    {day.date.toLocaleDateString(undefined, { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </p>
                                                <p className="text-xs sm:text-base lg:text-lg font-black text-white">
                                                    {day.calories.toLocaleString()}
                                                    <span className="text-[8px] sm:text-xs text-slate-300 ml-1">kcal</span>
                                                </p>
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 sm:border-8 border-transparent border-t-slate-900"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend - Full width */}
                        <div className="w-full mt-4 sm:mt-5 md:mt-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-start p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md bg-gradient-to-br from-green-500 to-green-600 shadow-md"></div>
                                <div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800">Optimal</span>
                                    <span className="hidden sm:inline text-xs text-slate-500 ml-1">(1200-2400 kcal)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 shadow-md"></div>
                                <div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800">Low</span>
                                    <span className="hidden sm:inline text-xs text-slate-500 ml-1">(&lt;1200 kcal)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-md bg-gradient-to-br from-red-500 to-rose-600 shadow-md"></div>
                                <div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800">High</span>
                                    <span className="hidden sm:inline text-xs text-slate-500 ml-1">(&gt;2400 kcal)</span>
                                </div>
                            </div>
                        </div>

                        {/* Summary Stats - Full width grid */}
                        <div className="w-full mt-4 sm:mt-5 md:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                                <p className="text-[10px] sm:text-xs text-amber-600 font-bold uppercase mb-1">Total Days</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">{activeData.length}</p>
                            </div>
                            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                                <p className="text-[10px] sm:text-xs text-amber-600 font-bold uppercase mb-1">Logged</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">
                                    {daysWithData.length}
                                </p>
                            </div>
                            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                                <p className="text-[10px] sm:text-xs text-amber-600 font-bold uppercase mb-1">Highest</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">
                                    {daysWithData.length > 0 ? Math.max(...daysWithData.map(d => d.calories)).toLocaleString() : '---'}
                                </p>
                            </div>
                            <div className="bg-amber-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-amber-200">
                                <p className="text-[10px] sm:text-xs text-amber-600 font-bold uppercase mb-1">Lowest</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-800">
                                    {daysWithData.length > 0 ? Math.min(...daysWithData.map(d => d.calories)).toLocaleString() : '---'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietHistory;