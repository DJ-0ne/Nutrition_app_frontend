import React, { useState, useEffect } from "react";
import { MEAL_TYPES } from "../../../constants/mealTypes";
import { Plus, ArrowLeft, Lock, Camera, Upload } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../auth/useAuth";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { SubscriptionTier } from "../../../constants/subscriptionTier";
import { useNavigate } from "react-router-dom";
import Sidebar from "./../../Sidebar/UserSidebar";
import { generateIDDSPDF } from "../../../services/iddsPdfService";

const IDDS_GROUPS = [
  {
    id: 1,
    name: "Cereals/Grains",
    examples: "Rice, maize, wheat, bread, porridge, noodles",
  },
  {
    id: 2,
    name: "Vitamin A-Rich Veg/Tubers",
    examples: "Carrots, pumpkin, sweet potatoes (orange), dark leafy greens",
  },
  {
    id: 3,
    name: "White Tubers/Roots",
    examples: "Potatoes, cassava, white yams",
  },
  {
    id: 4,
    name: "Other Vegetables",
    examples: "Tomato, onion, cucumber, cabbage",
  },
  { id: 5, name: "Other Fruits", examples: "Banana, apple, mango, citrus" },
  {
    id: 6,
    name: "Meat, Poultry, Offal",
    examples: "Beef, chicken, goat, liver, kidney",
  },
  { id: 7, name: "Eggs", examples: "Chicken, duck, or other eggs" },
  {
    id: 8,
    name: "Fish & Seafood",
    examples: "Fresh or dried fish, shellfish",
  },
  {
    id: 9,
    name: "Pulses, Legumes, Nuts",
    examples: "Beans, lentils, peanuts, soy, cashew",
  },
  {
    id: 10,
    name: "Milk & Milk Products",
    examples: "Fresh milk, yogurt, cheese",
  },
  { id: 11, name: "Oils & Fats", examples: "Butter, oil, ghee" },
  {
    id: 12,
    name: "Sweets/Sugar",
    examples: "Sugar, honey, candy, sugary drinks",
  },
  {
    id: 13,
    name: "Condiments/Spices",
    examples: "Spices, tea, coffee, sauces",
  },
];

const Recall = ({ userTier: propUserTier }) => {
  const { apiBaseURL, token: authToken } = useAuth();
  const navigate = useNavigate();

  const [currentTier, setCurrentTier] = useState(
    propUserTier || SubscriptionTier.PREMIUM,
  );
  const [userName, setUserName] = useState("");

  const [recallData, setRecallData] = useState({});
  const [currentInput, setCurrentInput] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 86400000).toISOString().split("T")[0],
  );
  const [iddsScores, setIddsScores] = useState({});
  const [loading, setLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedMealForAI, setSelectedMealForAI] = useState("lunch");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (propUserTier) setCurrentTier(propUserTier);
  }, [propUserTier]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) return;
      try {
        const res = await axios.get(`${apiBaseURL}/profile/`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = res.data;
        const tier =
          data.tier || data.subscription_tier || data.subscriptionTier;
        if (tier) setCurrentTier(tier);

        const name =
          data.name ||
          (data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`.trim()
            : "") ||
          data.username ||
          "User";
        setUserName(name);
      } catch (e) {
        if (e.message) {
          toast.error("Failed to fetch profile");
        }
      }
    };
    fetchProfile();
  }, [authToken, apiBaseURL]);

  const loadDataForDate = async (date) => {
    if (!authToken) {
      toast.error("Please log in to view your recall data");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };

      const foodsRes = await axios.get(
        `${apiBaseURL}/recall-foods/?date=${date}`,
        config,
      );
      const foodsArray = Array.isArray(foodsRes.data)
        ? foodsRes.data
        : foodsRes.data.results || [];
      const foodsData = foodsArray.reduce((acc, item) => {
        const meal = item.meal_type;
        if (!acc[meal]) acc[meal] = [];
        acc[meal].push({
          id: item.id.toString(),
          food: item.food_name,
          finished: item.finished,
        });
        return acc;
      }, {});

      setRecallData((prev) => ({ ...prev, [date]: foodsData }));

      const iddsRes = await axios.get(
        `${apiBaseURL}/idds-responses/?date=${date}`,
        config,
      );
      const iddsArray = Array.isArray(iddsRes.data)
        ? iddsRes.data
        : iddsRes.data.results || [];
      const iddsData = iddsArray.reduce((acc, item) => {
        acc[item.group_id] = item.consumed;
        return acc;
      }, {});

      setIddsScores((prev) => ({ ...prev, [date]: iddsData }));
    } catch (error) {
      console.error("Error loading recall data:", error);
      toast.error("Failed to load recall data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, apiBaseURL, authToken]);

  useEffect(() => {
    setAiSuggestions(null);
  }, [selectedDate]);

  const handleAddItem = (mealValue, foodName) => {
    const foodToAdd = (foodName || currentInput[mealValue])?.trim();
    if (!foodToAdd) return;

    const currentMealItems = recallData[selectedDate]?.[mealValue] || [];
    const isDuplicate = currentMealItems.some(
      (item) => item.food.toLowerCase() === foodToAdd.toLowerCase(),
    );
    toast.success("food added successfully");
    if (isDuplicate) {
      toast.error("Meal already logged", {
        description: "This food is already added to this meal today.",
      });
      return;
    }

    const newItem = {
      id: Date.now().toString() + Math.random(),
      food: foodToAdd,
      finished: true,
    };

    setRecallData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [mealValue]: [...(prev[selectedDate]?.[mealValue] || []), newItem],
      },
    }));

    if (!foodName) setCurrentInput((prev) => ({ ...prev, [mealValue]: "" }));
  };

  const toggleFinished = (mealValue, itemId) => {
    setRecallData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [mealValue]: (prev[selectedDate]?.[mealValue] || []).map((item) =>
          item.id === itemId ? { ...item, finished: !item.finished } : item,
        ),
      },
    }));
  };

  const removeItem = (mealValue, itemId) => {
    setRecallData((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [mealValue]: (prev[selectedDate]?.[mealValue] || []).filter(
          (item) => item.id !== itemId,
        ),
      },
    }));
  };

  const handlePhotoScan = async (e) => {
    if (currentTier !== SubscriptionTier.PREMIUM) {
      toast.error("AI Food Analysis is a Premium feature", {
        description: "Upgrade to Premium for instant photo logging.",
        action: { label: "Upgrade", onClick: () => navigate('/plan') }
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(`${apiBaseURL}/analyze-food-photo/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      const detected = data.detected_food?.trim();

      if (
        detected &&
        detected !== "No food detected"
      ) {
        setAiSuggestions([detected]);
        toast.success(`Detected: ${detected}`);
      } else {
        toast.error('No food detected in the image');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to analyze photo');
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!authToken) {
      toast.error("Please log in to save");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${authToken}` } };

      const currentDayData = recallData[selectedDate] || {};
      const foods = [];
      Object.keys(currentDayData).forEach((meal) => {
        currentDayData[meal].forEach((item) => {
          foods.push({
            meal_type: meal,
            food_name: item.food,
            finished: item.finished,
          });
        });
      });

      const currentIdds = iddsScores[selectedDate] || {};
      const idds = Object.keys(currentIdds).map((groupId) => ({
        group_id: parseInt(groupId),
        consumed: currentIdds[parseInt(groupId)],
      }));

      await axios.post(
        `${apiBaseURL}/save-recall/`,
        { date: selectedDate, foods, idds },
        config,
      );

      toast.success("Recall saved successfully");
      await loadDataForDate(selectedDate);
    } catch (error) {
      console.error("Error saving recall:", error);
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message;

      if (
        errorMsg.includes("duplicate key") ||
        errorMsg.includes("already exists")
      ) {
        toast.error("Meal already logged", {
          description:
            "This food is already logged for this date and meal type.",
        });
      } else {
        toast.error("Failed to save recall");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentTier === SubscriptionTier.FREE) {
      toast.error("Please upgrade to Pro Lite or Premium to download reports.");
      return;
    }
    generateIDDSPDF(
      selectedDate,
      iddsScores[selectedDate] || {},
      IDDS_GROUPS,
      userName,
      recallData[selectedDate] || {},
    );
    toast.info("Generating your PDF report...");
  };

  const currentDayData = recallData[selectedDate] || {};

  if (loading && Object.keys(currentDayData).length === 0) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 items-center justify-center">
        <div className="text-amber-600 font-medium">
          Loading your recall data...
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      <Sidebar />

      <div className="flex-1 overflow-y-auto w-full max-w-full">
        <div className="w-full max-w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 p-4 lg:p-8">
          <button
            onClick={() => navigate("/user/DietLog")}
            className="flex items-center gap-2 text-amber-600 font-medium text-sm hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Diet Log
          </button>

          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="w-full lg:w-auto">
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent break-words">
                24-Hour Recall
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1">
                Reconstruct your nutritional intake. Please specify if you
                finished each portion.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
              <label
                htmlFor="date-select"
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1"
              >
                Select Date
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/80 backdrop-blur border border-amber-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 w-full lg:w-auto"
              />
            </div>
          </header>

          {currentTier === SubscriptionTier.PREMIUM ? (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-200 relative overflow-hidden">
              <div className="relative z-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-1">
                    AI Food Analysis
                  </h3>
                  <p className="text-amber-100 text-sm font-medium">
                    Snap a pic or pick from gallery for instant logging.
                  </p>
                </div>

                {/* LOADING ANIMATION FOR FOOD ANALYSIS (shown after user selects a photo) */}
                {isScanning ? (
                  <div className="mt-6 flex flex-col items-center justify-center py-10 bg-white/10 rounded-2xl border border-white/20">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-5"></div>
                    <p className="font-semibold text-white text-base">Analyzing your photo...</p>
                    <p className="text-amber-100/80 text-sm mt-1 text-center max-w-[220px]">
                      AI is identifying the food • Please wait a moment
                    </p>
                  </div>
                ) : isMobile ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <label className="flex flex-col items-center justify-center bg-white/25 hover:bg-white/35 border border-white/40 hover:border-white/60 rounded-2xl py-5 cursor-pointer transition-all active:scale-[0.97] group">
                      <Camera className="w-7 h-7 mb-2.5 text-white group-active:scale-110 transition-transform" />
                      <span className="font-black text-sm">Take Photo</span>
                      <span className="text-[10px] text-amber-100/70 mt-0.5">Camera</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handlePhotoScan} 
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center bg-white/25 hover:bg-white/35 border border-white/40 hover:border-white/60 rounded-2xl py-5 cursor-pointer transition-all active:scale-[0.97] group">
                      <Upload className="w-7 h-7 mb-2.5 text-white group-active:scale-110 transition-transform" />
                      <span className="font-black text-sm">From Gallery</span>
                      <span className="text-[10px] text-amber-100/70 mt-0.5">Photos</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoScan} 
                      />
                    </label>
                  </div>
                ) : (
                  <label className="mt-4 inline-flex items-center gap-2 bg-white text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-amber-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoScan} 
                    />
                  </label>
                )}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-xl border border-amber-200 rounded-3xl p-8 text-center">
              <Lock className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="font-black text-xl text-slate-800 mb-2">AI Food Analysis</h3>
              <p className="text-slate-500 mb-6">Upload a photo and let AI instantly add your meal</p>
              <button onClick={() => navigate('/settings')} className="bg-amber-600 text-white font-black px-8 py-3 rounded-2xl hover:bg-amber-700">
                Upgrade to Premium
              </button>
            </div>
          )}

          {aiSuggestions && aiSuggestions.length > 0 && (
            <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 shadow-lg animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800">AI Detected Food</h4>
                  <p className="text-xs text-slate-500">
                    Add to the correct meal
                  </p>
                </div>
                <button
                  onClick={() => setAiSuggestions(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Add to meal:
                  </label>
                  <select
                    value={selectedMealForAI}
                    onChange={(e) => setSelectedMealForAI(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {MEAL_TYPES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {aiSuggestions.map((food, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-50"
                    >
                      <span className="text-sm font-medium text-amber-900">
                        {food}
                      </span>
                      <button
                        onClick={() => handleAddItem(selectedMealForAI, food)}
                        className="text-[10px] font-black bg-amber-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-amber-700"
                      >
                        ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-xl p-4 md:p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-white/50 space-y-8 w-full max-w-full">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Timeline for{" "}
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {MEAL_TYPES.map((meal) => (
              <div key={meal.value} className="space-y-4 group">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-amber-100"></div>
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                    {meal.label}
                  </label>
                  <div className="h-px flex-1 bg-amber-100"></div>
                </div>

                <div className="space-y-2">
                  {(currentDayData[meal.value] || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-amber-50 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
                    >
                      <span className="font-bold text-slate-700 text-sm break-words pr-2">
                        {item.food}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleFinished(meal.value, item.id)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all duration-300 ${
                            item.finished
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                          }`}
                        >
                          {item.finished ? "Yes" : "No"}
                        </button>
                        <button
                          onClick={() => removeItem(meal.value, item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-amber-50/30 border-2 border-amber-50 focus:border-amber-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all outline-none shadow-sm focus:shadow-lg placeholder:text-slate-300"
                    placeholder={`Add food to ${meal.label.toLowerCase()}...`}
                    value={currentInput[meal.value] || ""}
                    onChange={(e) =>
                      setCurrentInput({
                        ...currentInput,
                        [meal.value]: e.target.value,
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddItem(meal.value)
                    }
                  />
                  <button
                    onClick={() => handleAddItem(meal.value)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-200/50 hover:bg-amber-700 transition-all active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-8 border-t border-amber-100 w-full max-w-full">
              <header className="mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    Individual Dietary Diversity Score (IDDS)
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Did you consume any of the following food groups yesterday?
                    <span className="block text-xs text-amber-400 mt-1 font-bold uppercase tracking-wide">
                      Strictly based on the last 24 hours
                    </span>
                  </p>
                </div>

                {currentTier !== SubscriptionTier.FREE ? (
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 hover:scale-105 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-70">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Upgrade to Download
                  </div>
                )}
              </header>

              <div className="bg-white/60 rounded-2xl border border-amber-50 overflow-x-auto w-full max-w-full">
                <table className="w-full min-w-[600px] md:min-w-full table-auto">
                  <thead className="bg-amber-50/50 border-b border-amber-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">
                        #
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Food Group & Examples
                      </th>
                      <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">
                        Consumed?
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {IDDS_GROUPS.map((group) => {
                      const isChecked =
                        iddsScores[selectedDate]?.[group.id] || false;
                      return (
                        <tr
                          key={group.id}
                          className="hover:bg-white/80 transition-colors group"
                        >
                          <td className="py-4 px-6 text-sm font-bold text-slate-400">
                            {group.id}
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-700 whitespace-normal">
                              {group.name}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 font-medium whitespace-normal">
                              {group.examples}
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() =>
                                setIddsScores((prev) => ({
                                  ...prev,
                                  [selectedDate]: {
                                    ...(prev[selectedDate] || {}),
                                    [group.id]: !isChecked,
                                  },
                                }))
                              }
                              className={`w-full py-2 rounded-lg text-xs font-black uppercase tracking-wider border-2 transition-all duration-300 ${
                                isChecked
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200/50"
                                  : "bg-slate-50 border-slate-200 text-slate-400 hover:border-amber-200 hover:text-amber-400"
                              }`}
                            >
                              {isChecked ? "YES (1)" : "NO (0)"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50/80 border-t border-amber-50">
                    <tr>
                      <td
                        colSpan={2}
                        className="py-4 px-6 text-right text-xs font-black text-slate-500 uppercase tracking-widest"
                      >
                        Total Score (0-13)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-600 text-white font-black text-lg shadow-lg shadow-amber-300/50">
                          {
                            Object.values(
                              iddsScores[selectedDate] || {},
                            ).filter(Boolean).length
                          }
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:scale-[1.01] transition-all transform mt-8 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading
                ? "SAVING..."
                : `SAVE RECALL ENTRY FOR ${new Date(selectedDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recall;