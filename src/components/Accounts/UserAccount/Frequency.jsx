import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Mock data
const ffqData = [
  {
    id: "vegetables",
    title: "Vegetables",
    items: [
      { id: "veg_1", name: "Sukuma Wiki (Collard Greens) - 1 cup cooked" },
      { id: "veg_2", name: "Cabbage - 1 cup shredded" },
      { id: "veg_3", name: "Spinach - 1 cup cooked" },
      { id: "veg_4", name: "Carrots - 1 medium or ½ cup" },
      { id: "veg_5", name: "Tomatoes - 1 medium or ½ cup" },
      { id: "veg_6", name: "Onions - 1 medium or ½ cup chopped" },
      { id: "veg_7", name: "Kale - 1 cup chopped" },
      { id: "veg_8", name: "Green Peppers - 1 medium" },
    ]
  },
  {
    id: "fruits",
    title: "Fruits",
    items: [
      { id: "fruit_1", name: "Banana - 1 medium" },
      { id: "fruit_2", name: "Mango - 1 medium" },
      { id: "fruit_3", name: "Orange - 1 medium" },
      { id: "fruit_4", name: "Pineapple - 1 cup chunks" },
      { id: "fruit_5", name: "Watermelon - 1 cup cubes" },
      { id: "fruit_6", name: "Avocado - ½ medium" },
      { id: "fruit_7", name: "Passion Fruit - 3-4 fruits" },
      { id: "fruit_8", name: "Papaya - 1 cup cubes" },
    ]
  },
  {
    id: "grains_starches",
    title: "Grains and Starches",
    items: [
      { id: "grain_1", name: "Ugali - 1 medium slice (about 150g)" },
      { id: "grain_2", name: "Githeri (Maize & Beans) - 1 cup" },
      { id: "grain_3", name: "Rice (white) - 1 cup cooked" },
      { id: "grain_4", name: "Chapati - 1 medium" },
      { id: "grain_5", name: "Irish Potatoes - 1 medium" },
      { id: "grain_6", name: "Sweet Potatoes - 1 medium" },
      { id: "grain_7", name: "Spaghetti/Pasta - 1 cup cooked" },
      { id: "grain_8", name: "Bread - 2 slices" },
    ]
  },
  {
    id: "proteins",
    title: "Protein Foods",
    items: [
      { id: "protein_1", name: "Nyama Choma (Grilled Meat) - 1 piece (150g)" },
      { id: "protein_2", name: "Beef Stew - 1 cup" },
      { id: "protein_3", name: "Chicken - 1 piece (drumstick/thigh)" },
      { id: "protein_4", name: "Fish (Tilapia/Omena) - 1 medium fish" },
      { id: "protein_5", name: "Beans - 1 cup cooked" },
      { id: "protein_6", name: "Lentils - 1 cup cooked" },
      { id: "protein_7", name: "Green Grams - 1 cup cooked" },
      { id: "protein_8", name: "Eggs - 1 egg" },
    ]
  },
  {
    id: "dairy",
    title: "Dairy Products",
    items: [
      { id: "dairy_1", name: "Fresh Milk - 1 glass (250ml)" },
      { id: "dairy_2", name: "Mursik (Fermented Milk) - 1 cup" },
      { id: "dairy_3", name: "Yogurt - 1 cup" },
      { id: "dairy_4", name: "Cheese - 1 slice (30g)" },
    ]
  }
];

const FREQUENCY_OPTIONS = [
  { value: "never", label: "Never" },
  { value: "1-3_per_month", label: "1-3 per month" },
  { value: "1_per_week", label: "1 per week" },
  { value: "2-4_per_week", label: "2-4 per week" },
  { value: "5-6_per_week", label: "5-6 per week" },
  { value: "1_per_day", label: "1 per day" },
  { value: "2-3_per_day", label: "2-3 per day" },
  { value: "4+_per_day", label: "4+ per day" },
];

// Mock auth hook
const useAuth = () => ({
  apiBaseURL: 'http://localhost:8000'
});

const Frequency = () => {
  const { apiBaseURL } = useAuth();
  const [responses, setResponses] = useState({});
  const [cachedInsights, setCachedInsights] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load responses and cached insights on mount
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingResponses(false);
        return;
      }

      try {
        // Load responses
        const responsesRes = await fetch(`${apiBaseURL}/api/ffq-responses/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (responsesRes.ok) {
          const data = await responsesRes.json();
          const loaded = {};
          data.forEach((r) => {
            loaded[r.item_id] = r.frequency;
          });
          setResponses(loaded);
        }

        // Load cached insights
        const insightsRes = await fetch(`${apiBaseURL}/api/ffq-insights/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (insightsRes.ok) {
          const data = await insightsRes.json();
          if (data.insights) {
            setCachedInsights(data.insights);
            setShowInsights(true);
          }
        }
      } catch (err) {
        console.error("Failed to load FFQ data", err);
      } finally {
        setLoadingResponses(false);
      }
    };

    loadData();
  }, [apiBaseURL]);

  const generateAndSaveInsights = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoadingInsights(true);
    try {
      const res = await fetch(`${apiBaseURL}/api/generate-ffq-insights/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate insights");
      }

      const data = await res.json();
      setCachedInsights(data.insights);
      setShowInsights(true);
      toast.success("Fresh insights generated!");
    } catch (err) {
      toast.error(err.message || "Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleOptionChange = (itemId, option) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: option,
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    if (Object.keys(responses).length === 0) {
      toast.error("Please answer at least one question before saving.");
      return;
    }

    try {
      const saveRes = await fetch(`${apiBaseURL}/api/save-ffq/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ responses }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save responses");
      }

      toast.success("Questionnaire saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save questionnaire");
    }
  };

  // Calculate progress
  const totalItems = ffqData.reduce(
    (acc, section) => acc + section.items.length,
    0,
  );
  const answeredItems = Object.keys(responses).length;
  const progress = Math.round((answeredItems / totalItems) * 100);

  // Helper to render insights with formatting
  const renderInsights = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      // Title (starts with #)
      if (trimmed.startsWith('#')) {
        return (
          <h5 key={index} className="text-xl font-black text-amber-800 mb-4 mt-3 first:mt-0 border-b border-amber-200 pb-2">
            {trimmed.replace(/^#\s*/, '')}
          </h5>
        );
      }
      
      // Bullet point (starts with -)
      if (trimmed.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 flex-shrink-0"></div>
            <span className="text-slate-700 text-base font-medium leading-relaxed">
              {trimmed.substring(1).trim()}
            </span>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-slate-700 text-base font-medium leading-relaxed mb-4 last:mb-0">
          {trimmed}
        </p>
      );
    });
  };

  if (loadingResponses) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-amber-600 font-bold text-xl">Loading questionnaire...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="w-full space-y-6 sm:space-y-8">
          {/* Header Section - Crystal clear */}
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-amber-200">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800">
                  Food Frequency 
                  <span className="block sm:inline sm:ml-2 text-amber-600">
                    Questionnaire
                  </span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed">
                  This questionnaire helps us understand your usual eating patterns over the past year. 
                  For each food item, select how often you typically consume the specified amount.
                </p>
              </div>

              {/* Progress Card - Highly visible */}
              <div className="w-full xl:w-96 bg-amber-50 rounded-xl p-5 border-2 border-amber-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-amber-800 uppercase tracking-wider">Progress</span>
                  <span className="text-2xl font-black text-amber-600">{progress}%</span>
                </div>
                <div className="h-4 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-slate-600 font-medium">Answered: {answeredItems}</span>
                  <span className="text-slate-600 font-medium">Total: {totalItems}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questionnaire Sections */}
          <div className="w-full space-y-6">
            {ffqData.map((section) => (
              <div
                key={section.id}
                className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-amber-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-800">
                    {section.title}
                  </h2>
                  <p className="text-sm text-amber-600 mt-1">
                    {section.items.length} items • Select frequency for each
                  </p>
                </div>

                {/* Table Container */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider p-4 w-72 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                          Food Item
                        </th>
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <th
                            key={opt.value}
                            className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider p-3 min-w-[90px]"
                          >
                            {opt.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {section.items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-amber-50/50 transition-colors"
                        >
                          <td className="p-4 text-sm font-medium text-slate-700 sticky left-0 bg-white hover:bg-amber-50/50 transition-colors z-10 border-r border-slate-200">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-500 font-bold mr-2">{index + 1}.</span>
                              <span>{item.name}</span>
                            </div>
                          </td>
                          {FREQUENCY_OPTIONS.map((opt) => (
                            <td key={opt.value} className="p-3 text-center">
                              <label className="cursor-pointer block">
                                <input
                                  type="radio"
                                  name={item.id}
                                  value={opt.value}
                                  checked={responses[item.id] === opt.value}
                                  onChange={() =>
                                    handleOptionChange(item.id, opt.value)
                                  }
                                  className="hidden"
                                />
                                <div className={`
                                  w-6 h-6 mx-auto rounded-full border-2 transition-all
                                  ${responses[item.id] === opt.value 
                                    ? 'border-amber-500 bg-amber-500' 
                                    : 'border-slate-300 hover:border-amber-400 bg-white'
                                  }
                                `}>
                                  {responses[item.id] === opt.value && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                  )}
                                </div>
                              </label>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar - Sticky and prominent */}
          <div className="sticky bottom-4 z-40 bg-white shadow-2xl rounded-xl border-2 border-amber-200 p-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={Object.keys(responses).length === 0}
                className="px-6 py-3 rounded-lg font-bold text-base transition-all
                  bg-white text-amber-600 border-2 border-amber-300
                  hover:bg-amber-50 hover:border-amber-400
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                  flex items-center justify-center gap-2"
              >
                <span>💾</span>
                Save Answers
              </button>
              <button
                onClick={generateAndSaveInsights}
                disabled={loadingInsights || Object.keys(responses).length === 0}
                className="px-6 py-3 rounded-lg font-bold text-base transition-all
                  bg-amber-500 text-white border-2 border-amber-600
                  hover:bg-amber-600 hover:border-amber-700
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500
                  flex items-center justify-center gap-2 min-w-[200px]"
              >
                {loadingInsights ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    Generate Insights
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Insights Panel - Clear and readable */}
          {showInsights && cachedInsights && (
            <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-amber-200 pb-3">
                <h3 className="text-xl font-black text-amber-800">
                  Your Eating Pattern Analysis
                </h3>
                <button
                  onClick={() => setShowInsights(false)}
                  className="w-8 h-8 rounded-full bg-white border border-amber-200 text-amber-600 font-bold hover:bg-amber-50 transition-colors flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-slate-700">
                {renderInsights(cachedInsights)}
              </div>
            </div>
          )}

          {/* No Insights Message */}
          {Object.keys(responses).length > 0 && !showInsights && (
            <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700 text-lg font-medium">
                Click "Generate Insights" above to see your personalized analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Frequency;