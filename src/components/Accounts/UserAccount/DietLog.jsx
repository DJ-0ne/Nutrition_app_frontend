/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Dummy auth for now
const useAuth = () => ({
  apiBaseURL: 'http://localhost:8000'
});

// Constants
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

// Dummy data
const dummyFoods = [
  {
    id: '1',
    englishName: 'Sukuma Wiki (Collard Greens)',
    swahiliName: 'Sukuma Wiki',
    localNames: ['Collard Greens', 'Kale'],
    category: 'Vegetables',
    nutrientsPer100g: { calories: 32, protein: 2.5, fat: 0.5, carbs: 5.5, fiber: 2.0 },
    commonPortions: [
      { id: 'p1', name: '1 cup chopped', gramEquivalent: 130, description: 'Chopped leaves' },
      { id: 'p2', name: '1 bunch', gramEquivalent: 350, description: 'Whole bunch' },
      { id: 'p3', name: '1 handful', gramEquivalent: 50, description: 'Handful of leaves' }
    ]
  },
  {
    id: '2',
    englishName: 'Githeri (Maize & Beans)',
    swahiliName: 'Githeri',
    localNames: ['Maize and Beans', 'Mixed Stew'],
    category: 'Main Dishes',
    nutrientsPer100g: { calories: 135, protein: 6.5, fat: 2.5, carbs: 22, fiber: 4.5 },
    commonPortions: [
      { id: 'p1', name: '1 cup', gramEquivalent: 240, description: 'Cooked' },
      { id: 'p2', name: '1 bowl', gramEquivalent: 350, description: 'Standard serving' },
      { id: 'p3', name: '1 ladle', gramEquivalent: 150, description: 'Ladle serving' }
    ]
  },
  {
    id: '3',
    englishName: 'Ugali (Cornmeal Porridge)',
    swahiliName: 'Ugali',
    localNames: ['Cornmeal', 'Nsima', 'Sadza'],
    category: 'Staples',
    nutrientsPer100g: { calories: 120, protein: 2.5, fat: 0.5, carbs: 26, fiber: 1.5 },
    commonPortions: [
      { id: 'p1', name: '1 slice', gramEquivalent: 150, description: 'Standard slice' },
      { id: 'p2', name: '1 ball', gramEquivalent: 200, description: 'Hand-formed ball' },
      { id: 'p3', name: '1 serving', gramEquivalent: 180, description: 'Restaurant serving' }
    ]
  },
  {
    id: '4',
    englishName: 'Nyama Choma (Grilled Meat)',
    swahiliName: 'Nyama Choma',
    localNames: ['Grilled Meat', 'Roasted Meat'],
    category: 'Meat',
    nutrientsPer100g: { calories: 250, protein: 28, fat: 15, carbs: 0, fiber: 0 },
    commonPortions: [
      { id: 'p1', name: '1 piece', gramEquivalent: 150, description: 'Single piece' },
      { id: 'p2', name: '1 portion', gramEquivalent: 250, description: 'Standard portion' },
      { id: 'p3', name: '1 kg', gramEquivalent: 1000, description: 'Kilogram' }
    ]
  },
  {
    id: '5',
    englishName: 'Mursik (Fermented Milk)',
    swahiliName: 'Mursik',
    localNames: ['Fermented Milk', 'Sour Milk'],
    category: 'Dairy',
    nutrientsPer100g: { calories: 85, protein: 5, fat: 4, carbs: 7, fiber: 0 },
    commonPortions: [
      { id: 'p1', name: '1 cup', gramEquivalent: 240, description: 'Traditional cup' },
      { id: 'p2', name: '1 gourd', gramEquivalent: 500, description: 'Small gourd' },
      { id: 'p3', name: '1 glass', gramEquivalent: 200, description: 'Glass serving' }
    ]
  }
];

const dummyLogs = [
  {
    id: 'log1',
    foodId: '1',
    foodName: 'Sukuma Wiki (Collard Greens)',
    portionId: 'p1',
    portionName: '1 cup chopped',
    grams: 130,
    date: new Date().toISOString().slice(0, 10),
    mealType: 'lunch',
    nutrients: { calories: 42, protein: 3.3, fat: 0.7, carbs: 7.2, fiber: 2.6 },
    finished: true
  },
  {
    id: 'log2',
    foodId: '2',
    foodName: 'Githeri (Maize & Beans)',
    portionId: 'p2',
    portionName: '1 bowl',
    grams: 350,
    date: new Date().toISOString().slice(0, 10),
    mealType: 'lunch',
    nutrients: { calories: 473, protein: 22.8, fat: 8.8, carbs: 77, fiber: 15.8 },
    finished: true
  },
  {
    id: 'log3',
    foodId: '3',
    foodName: 'Ugali (Cornmeal Porridge)',
    portionId: 'p1',
    portionName: '1 slice',
    grams: 150,
    date: new Date().toISOString().slice(0, 10),
    mealType: 'lunch',
    nutrients: { calories: 180, protein: 3.8, fat: 0.8, carbs: 39, fiber: 2.3 },
    finished: true
  }
];

const dummyAnthroData = {
  heightCm: 175,
  weightKg: 80,
  age: 32,
  sex: 'male',
  waistCm: 92,
  conditions: ['Hypertension'],
  conditionsOnly: '',
  activityLevel: 3,
  date: new Date().toISOString()
};

const DietLog = ({ 
  logs = dummyLogs, 
  userTier = SubscriptionTier.PREMIUM, 
  onLog = () => {}, 
  onClear = () => {}, 
  anthroData = dummyAnthroData, 
  onNavigate = () => {} 
}) => {
  const { apiBaseURL } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [allFoods, setAllFoods] = useState(dummyFoods);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('breakfast');
  const [showInsights, setShowInsights] = useState(false);
  const [insightText, setInsightText] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [finished, setFinished] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // ---------- Memoised totals ----------
  const totals = useMemo(() => {
    const initial = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    return logs.reduce((acc, log) => {
      acc.calories += Number(log.nutrients?.calories || 0);
      acc.protein  += Number(log.nutrients?.protein  || 0);
      acc.carbs    += Number(log.nutrients?.carbs    || 0);
      acc.fat      += Number(log.nutrients?.fat      || 0);
      acc.fiber    += Number(log.nutrients?.fiber    || 0);
      return acc;
    }, initial);
  }, [logs]);

  // ---------- Debounced food search ----------
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setAllFoods(dummyFoods);
      return;
    }

    const searchFoods = async (query) => {
      setIsLoading(true);
      
      // Simulate API search with dummy data
      setTimeout(() => {
        const filtered = dummyFoods.filter(food => 
          food.englishName.toLowerCase().includes(query.toLowerCase()) ||
          food.swahiliName.toLowerCase().includes(query.toLowerCase())
        );
        setAllFoods(filtered);
        
        if (filtered.length === 0) {
          toast.error('Food not found');
        }
        setIsLoading(false);
      }, 800);
    };

    const timer = setTimeout(() => {
      searchFoods(searchTerm);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ---------- Dummy Photo Scan ----------
  const handlePhotoScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    // Simulate AI analysis
    setTimeout(() => {
      const randomFood = dummyFoods[Math.floor(Math.random() * dummyFoods.length)];
      setSearchTerm(randomFood.englishName);
      toast.success(`Food detected: ${randomFood.englishName}`);
      setIsScanning(false);
      e.target.value = '';
    }, 2000);
  };

  // ---------- Log a meal ----------
  const handleLog = () => {
    if (!selectedFood || !selectedPortion) return;

    if (userTier === SubscriptionTier.FREE && logs.length >= 50) {
      toast.error('Free tier log limit reached. Upgrade for unlimited tracking!');
      return;
    }

    const grams = selectedPortion.gramEquivalent * quantity;

    const nutrients = Object.entries(selectedFood.nutrientsPer100g).reduce((acc, [key, val]) => {
      acc[key] = Number((val * grams) / 100);
      return acc;
    }, {});

    const newLog = {
      id: Date.now().toString(),
      foodId: selectedFood.id,
      foodName: selectedFood.englishName,
      portionId: selectedPortion.id,
      portionName: selectedPortion.name,
      grams,
      date: new Date().toISOString().slice(0, 10),
      mealType,
      nutrients,
      finished,
    };

    onLog(newLog);
    toast.success('Meal logged successfully!');

    // Reset form
    setSelectedFood(null);
    setSelectedPortion(null);
    setQuantity(1);
    setSearchTerm('');
    setMealType('breakfast');
    setFinished(true);
  };

  const handleClear = () => {
    if (logs.length === 0) return;
    if (!window.confirm('Clear all meal logs? This cannot be undone.')) return;
    onClear();
    toast.success('Meal history cleared');
  };

  // ---------- Generate AI insights ----------
  const handleGenerateInsights = async () => {
    if (!anthroData) {
      toast.error('Please complete your profile first.');
      return;
    }
    if (logs.length === 0) {
      toast.error('Log some meals first to generate insights.');
      return;
    }

    setLoadingInsights(true);

    // Simulate AI insights
    setTimeout(() => {
      const insights = `# Nutritional Analysis
    
- Your protein intake (${totals.protein.toFixed(1)}g) is adequate for your activity level
- Consider increasing fiber intake - current ${totals.fiber.toFixed(1)}g vs recommended 25-30g
- Your carbohydrate distribution is well-balanced across meals
- Based on your profile, we recommend monitoring sodium intake

# Recommendations
- Add more leafy greens to increase micronutrient density
- Consider incorporating more legumes for plant-based protein
- Your current meal timing aligns well with your activity pattern`;

      setInsightText(insights);
      setShowInsights(true);
      setLoadingInsights(false);
    }, 1500);
  };

  // Helper to render formatted insights
  const renderInsights = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Title (starts with #)
      if (trimmed.startsWith('#')) {
        return (
          <h5 key={index} className="text-lg font-extrabold text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text mb-3 mt-2 first:mt-0">
            {trimmed.replace(/^#\s*/, '')}
          </h5>
        );
      }
      
      // Bullet point (starts with -)
      if (trimmed.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-700 text-base leading-relaxed break-words">
              {trimmed.substring(1).trim()}
            </span>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-slate-700 text-base leading-relaxed mb-3 last:mb-0 break-words">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[2000px] mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent break-words">
              Dietary Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Input meal data using Kenyan household measures.
            </p>
          </div>
          <button
            onClick={handleClear}
            disabled={logs.length === 0}
            className="text-xs text-red-600 font-black px-3 sm:px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-300 border border-red-100 hover:scale-105 hover:shadow-lg shadow-red-100/50 disabled:opacity-50 whitespace-nowrap"
          >
            CLEAR LOGS
          </button>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Logging Interface */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* AI Quick Actions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* AI Photo Scan Card */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="font-black uppercase tracking-widest text-[10px] sm:text-xs">AI Photo Scan</h3>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-amber-100 font-medium opacity-80">Snap a pic to auto-log</p>
                  </div>

                  <label className="mt-3 bg-white/20 hover:bg-white/30 text-white text-[9px] sm:text-[10px] font-black py-2 px-3 rounded-lg text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
                    {isScanning ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <span>Take Photo</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoScan} 
                      disabled={isScanning} 
                    />
                  </label>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              </div>

              {/* 24h Recall Link Card */}
              <button
                onClick={() => onNavigate('recall')}
                className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl sm:rounded-2xl p-4 text-left shadow-sm hover:shadow-md hover:border-amber-200 transition-all group relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-amber-600">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Full 24h Recall</h3>
                    </div>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] font-medium">Missed a meal? Retro-log it now.</p>
                  </div>
                  <div className="mt-3 text-slate-800 text-[9px] sm:text-[10px] font-black flex items-center gap-1 group-hover:gap-2 transition-all">
                    LAUNCH SESSION <span>→</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Log Form Card */}
            <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(251,146,60,0.1)] hover:border-amber-200/50 relative group">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none"></div>

              {!selectedFood ? (
                <div className="relative transition-all duration-300 z-10">
                  <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-slate-50/50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-lg sm:rounded-xl md:rounded-2xl pl-10 sm:pl-12 p-2.5 sm:p-3 md:p-4 text-slate-800 transition-all duration-300 font-medium placeholder:text-slate-400 shadow-sm focus:shadow-lg focus:shadow-amber-200/50 text-sm sm:text-base md:text-lg"
                    placeholder="Find Kenyan food (e.g., Sukuma Wiki, Githeri...)"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  {isLoading && (
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {allFoods.length > 0 && searchTerm.length >= 3 && (
                    <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-lg sm:rounded-xl md:rounded-2xl mt-2 max-h-60 sm:max-h-72 overflow-y-auto z-50 divide-y divide-slate-100">
                      {allFoods.map((f, idx) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setSelectedFood(f);
                            setSearchTerm('');
                            setAllFoods([]);
                          }}
                          className="w-full text-left p-2.5 sm:p-3 md:p-4 hover:bg-amber-50 transition-all duration-300 flex items-center justify-between"
                        >
                          <div className="pr-2">
                            <p className="font-bold text-slate-800 text-xs sm:text-sm md:text-base">{f.englishName}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400 font-medium italic">{f.swahiliName}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-600 to-orange-600 text-white p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-in zoom-in-95 duration-300 z-10 relative">
                  <div className="flex justify-between items-center bg-gradient-to-r from-amber-600 to-orange-600 p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl text-white shadow-lg shadow-amber-200/50">
                    <div className="pr-2">
                      <p className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">Selected Component</p>
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-black break-words">{selectedFood.englishName}</p>
                      <p className="text-xs sm:text-sm font-medium opacity-90 italic">{selectedFood.swahiliName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFood(null);
                        setSelectedPortion(null);
                        setQuantity(1);
                      }}
                      aria-label="Close"
                      className="bg-white/20 hover:bg-white/40 p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 hover:rotate-90 flex-shrink-0"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    {/* Portions */}
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Portion System</label>
                      <div className="grid grid-cols-1 gap-1.5 sm:gap-2 max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {selectedFood.commonPortions.map((p, idx) => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPortion(p)}
                            className={`flex items-center justify-between p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl border-2 transition-all ${
                              selectedPortion?.id === p.id 
                                ? 'bg-amber-50/50 border-amber-500 text-amber-800 shadow-lg shadow-amber-100/50' 
                                : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-amber-200'
                            }`}
                          >
                            <span className="truncate mr-2">{p.name}</span>
                            <span className="text-[8px] sm:text-[9px] md:text-[10px] opacity-60 bg-white/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md whitespace-nowrap flex-shrink-0">{p.gramEquivalent}g</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity and Meal Details */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                        <div className="flex items-center justify-center bg-slate-50 border-2 border-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 focus-within:border-amber-500">
                          <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-slate-400 hover:text-amber-600 font-bold text-lg sm:text-xl transition-all hover:scale-110 hover:bg-white rounded-lg flex-shrink-0"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-12 sm:w-14 md:w-16 bg-transparent border-none text-center font-black text-lg sm:text-xl md:text-2xl text-slate-800 focus:ring-0"
                          />
                          <button 
                            onClick={() => setQuantity(quantity + 1)} 
                            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-slate-400 hover:text-amber-600 font-bold text-lg sm:text-xl transition-all hover:scale-110 hover:bg-white rounded-lg flex-shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Meal Context</label>
                        <select
                          value={mealType}
                          onChange={e => setMealType(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 focus:border-amber-500 focus:bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 font-bold text-slate-700 appearance-none transition-all cursor-pointer text-xs sm:text-sm"
                        >
                          {MEAL_TYPES.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                        <div className="flex bg-slate-50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border-2 border-slate-100">
                          <button
                            onClick={() => setFinished(true)}
                            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] md:text-xs font-black transition-all ${
                              finished ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            FINISHED
                          </button>
                          <button
                            onClick={() => setFinished(false)}
                            className={`flex-1 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] md:text-xs font-black transition-all ${
                              !finished ? 'bg-white text-red-500 shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            LEFTOVERS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLog}
                    disabled={!selectedPortion}
                    className="w-full bg-slate-900 hover:bg-black text-white font-black py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-xl disabled:opacity-50 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group text-sm sm:text-base"
                  >
                    <span>COMMIT TO DIARY</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Totals & Insights */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:sticky lg:top-24">
            {/* Nutrition Totals */}
            <section className="bg-slate-900 p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl text-white shadow-lg border border-slate-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700"></div>

              <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-3 sm:mb-4 md:mb-6 relative z-10">Daily Totals</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 relative z-10">
                <div className="space-y-0.5 sm:space-y-1 hover:scale-105 origin-left transition-all">
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tighter break-words">{totals.calories.toFixed(0)}</p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Calories</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1 hover:scale-105 origin-left transition-all">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-blue-400 break-words">{totals.protein.toFixed(1)}<span className="text-[8px] sm:text-[9px] md:text-xs ml-0.5 text-blue-300">g</span></p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Protein</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1 hover:scale-105 origin-left transition-all">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-amber-400 break-words">{totals.carbs.toFixed(1)}<span className="text-[8px] sm:text-[9px] md:text-xs ml-0.5 text-amber-300">g</span></p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Carbs</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1 hover:scale-105 origin-left transition-all">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-rose-400 break-words">{totals.fat.toFixed(1)}<span className="text-[8px] sm:text-[9px] md:text-xs ml-0.5 text-rose-300">g</span></p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Fats</p>
                </div>
                <div className="space-y-0.5 sm:space-y-1 hover:scale-105 origin-left transition-all col-span-2">
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-purple-400 break-words">{totals.fiber.toFixed(1)}<span className="text-[8px] sm:text-[9px] md:text-xs ml-0.5 text-purple-300">g</span></p>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">Fiber</p>
                </div>
              </div>
            </section>

            {/* AI Insights */}
            {logs.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {userTier === SubscriptionTier.FREE ? (
                  <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/50 text-center">
                    <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Upgrade for AI Analysis</p>
                    <button 
                      onClick={() => onNavigate('settings')} 
                      className="text-amber-600 text-[9px] sm:text-[10px] md:text-xs font-black underline hover:text-amber-700 hover:scale-105 inline-block transition-all"
                    >
                      VIEW PRO FEATURES
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInsights}
                    disabled={loadingInsights}
                    className="w-full bg-white border-2 border-amber-100 text-amber-600 font-black py-3 sm:py-4 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-amber-50 hover:border-amber-200 transition-all flex items-center justify-center gap-2 sm:gap-3 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-amber-100 text-xs sm:text-sm"
                  >
                    {loadingInsights ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                        ANALYZING...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI CLINICAL INSIGHTS
                      </>
                    )}
                  </button>
                )}

                {showInsights && insightText && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-amber-100 animate-in slide-in-from-top-4 duration-300 shadow-sm">
                    <div className="flex justify-between items-center mb-3 sm:mb-4 border-b border-amber-100 pb-2">
                      <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-amber-800 uppercase tracking-widest">Analysis</h4>
                      <button 
                        onClick={() => setShowInsights(false)} 
                        className="text-amber-400 hover:text-amber-600 transition-colors font-bold text-base sm:text-lg"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="prose prose-amber max-w-none text-xs sm:text-sm">
                      {renderInsights(insightText)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Log History */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/50 shadow-lg overflow-hidden">
              <div className="p-2.5 sm:p-3 md:p-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Today's Log</h3>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-300">{logs.length} items</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="p-6 sm:p-8 md:p-10 lg:p-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
                    No entries yet. Start logging meals!
                  </div>
                ) : (
                  logs.map((log, idx) => {
                    const mealLabel = MEAL_TYPES.find(m => m.value === log.mealType)?.label || log.mealType;
                    return (
                      <div key={log.id} className="p-2.5 sm:p-3 md:p-4 hover:bg-amber-50/30 transition-all flex justify-between items-center group">
                        <div className="pr-2">
                          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-wider text-amber-400/80 mb-0.5">{mealLabel}</p>
                          <p className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-amber-700 transition-colors break-words">{log.foodName}</p>
                          <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-medium break-words">
                            {log.portionName} • {log.grams}g • {' '}
                            <span className={log.finished ? 'text-emerald-500' : 'text-red-400'}>
                              {log.finished ? 'Finished' : 'Leftovers'}
                            </span>
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-slate-700 text-xs sm:text-sm">
                            {Number(log.nutrients?.calories || 0).toFixed(0)} kcal
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietLog;