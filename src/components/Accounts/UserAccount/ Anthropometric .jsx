
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Ruler, 
  Weight, 
  Activity, 
  Heart, 
  User, 
  Calendar, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Target,
  Flame,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../../auth/authtoken';


// Medical conditions matching your Django model
const COMMON_CONDITIONS = {
  'None': ['None / Not Applicable'],
  'Metabolic': ['Diabetes Type 2', 'Diabetes Type 1', 'High Cholesterol', 'Thyroid Disorder'],
  'Cardiovascular': ['Hypertension', 'Heart Disease'],
  'Respiratory': ['Asthma'],
  'Musculoskeletal': ['Arthritis', 'Back Pain'],
  'Reproductive': ['PCOS', 'Endometriosis'],
  'Autoimmune': ['Autoimmune Disease', 'Rheumatoid Arthritis', 'Lupus'],
  'Mental Health': ['Depression/Anxiety'],
  'Digestive': ['IBS/GI Issues', 'GERD', 'Celiac Disease'],
  'Other': ['Migraines', 'Cancer (in remission)', 'Kidney Disease', 'Liver Disease', 'Eating Disorder History']
};

const Anthropometric = ({ onSave = () => {} }) => {
  const { token, apiBaseURL } = useAuth();
  const [activeTab, setActiveTab] = useState('basics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    height_cm: 170,
    weight_kg: 70,
    age: 25,
    sex: 'male',
    waist_cm: null,
    medical_conditions: [],
    other_medical_condition: '',
    activity_level: 1,
  });

  const [showManualInput, setShowManualInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['None']);

  // Fetch existing profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error('Please login first');
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
          setFormData({
            height_cm: data.height_cm || 170,
            weight_kg: data.weight_kg || 70,
            age: data.age || 25,
            sex: data.sex || 'male',
            waist_cm: data.waist_cm,
            medical_conditions: data.medical_conditions || [],
            other_medical_condition: data.other_medical_condition || '',
            activity_level: data.activity_level || 1,
          });
          
          if (data.other_medical_condition) {
            setShowManualInput(true);
          }
        } else if (response.status === 401) {
          // Token expired - redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, apiBaseURL]);

  const bmiData = useMemo(() => {
    if (!formData.height_cm || !formData.weight_kg) return null;
    const hM = formData.height_cm / 100;
    const bmi = formData.weight_kg / (hM * hM);
    let status = '';
    let color = '';
    let bgColor = '';

    if (bmi < 18.5) {
      status = 'Underweight';
      color = 'text-amber-600';
      bgColor = 'bg-amber-50';
    } else if (bmi < 25) {
      status = 'Healthy';
      color = 'text-emerald-600';
      bgColor = 'bg-emerald-50';
    } else if (bmi < 30) {
      status = 'Overweight';
      color = 'text-amber-600';
      bgColor = 'bg-amber-50';
    } else {
      status = 'Obesity';
      color = 'text-orange-600';
      bgColor = 'bg-orange-50';
    }

    return { value: bmi.toFixed(1), status, color, bgColor };
  }, [formData.height_cm, formData.weight_kg]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleCondition = (condition) => {
    let current = formData.medical_conditions || [];

    if (condition === 'None / Not Applicable') {
      if (!current.includes('None / Not Applicable')) {
        setFormData({ 
          ...formData, 
          medical_conditions: ['None / Not Applicable'], 
          other_medical_condition: '' 
        });
        setShowManualInput(false);
      } else {
        setFormData({ ...formData, medical_conditions: [] });
      }
      return;
    }

    if (current.includes('None / Not Applicable')) {
      current = [];
    }

    if (current.includes(condition)) {
      setFormData({ 
        ...formData, 
        medical_conditions: current.filter(c => c !== condition) 
      });
    } else {
      setFormData({ 
        ...formData, 
        medical_conditions: [...current, condition] 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medical_conditions || formData.medical_conditions.length === 0) {
      toast.error("Please indicate your health conditions");
      setActiveTab('conditions');
      return;
    }

    if (!formData.height_cm || !formData.weight_kg || !formData.age || !formData.sex) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!token) {
      toast.error('Please login first');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        height_cm: formData.height_cm,
        weight_kg: formData.weight_kg,
        age: formData.age,
        sex: formData.sex,
        waist_cm: formData.waist_cm || null,
        medical_conditions: formData.medical_conditions,
        other_medical_condition: formData.other_medical_condition || '',
        activity_level: formData.activity_level,
      };

      const response = await fetch(`${apiBaseURL}/profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to save profile');
      }

      const savedData = await response.json();
      toast.success('Profile saved successfully!');
      onSave(savedData);
    } catch (err) {
      toast.error(err.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const activityLabels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active', 'Athlete'];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      {/* Header -完全相同 */}
      <div className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-xl sm:text-2xl font-bold">Health Profile</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-amber-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Health Profile
            </h1>
            <p className="text-amber-100 mt-1">
              Your personal health metrics for personalized nutrition planning
            </p>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 lg:hidden">
              <p className="text-amber-100 text-sm mb-3">
                Your personal health metrics for personalized nutrition planning
              </p>
              <div className="flex gap-2 bg-amber-800/30 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveTab('basics');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all  ${
                    activeTab === 'basics'
                      ? 'bg-white text-amber-700 shadow-lg'
                      : 'text-amber-100 hover:bg-amber-800/40'
                  }`}
                >
                  Basics
                </button>
                <button
                  onClick={() => {
                    setActiveTab('conditions');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all  ${
                    activeTab === 'conditions'
                      ? 'bg-white text-amber-700 shadow-lg'
                      : 'text-amber-100 hover:bg-amber-800/40'
                  }`}
                >
                  Health
                </button>
              </div>
            </div>
          )}

          <div className="hidden lg:flex gap-2 bg-amber-800/30 p-1 rounded-xl w-fit mt-4">
            <button
              onClick={() => setActiveTab('basics')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'basics'
                  ? 'bg-white text-amber-700 shadow-lg'
                  : 'text-amber-100 hover:bg-amber-800/40'
              }`}
            >
              Basics
            </button>
            <button
              onClick={() => setActiveTab('conditions')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'conditions'
                  ? 'bg-white text-amber-700 shadow-lg'
                  : 'text-amber-100 hover:bg-amber-800/40'
              }`}
            >
              Health
            </button>
          </div>
        </div>
      </div>

      {/* Main Content -完全相同 but using backend field names */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="w-full max-w-[2000px] mx-auto">
          {/* Quick Stats Cards */}
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Height</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{formData.height_cm || '—'} cm</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{formData.weight_kg || '—'} kg</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Age/Sex</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">
                    {formData.age || '—'} / {formData.sex === 'male' ? 'M' : 'F'}
                  </p>
                </div>
              </div>
            </div>
            
            {bmiData && (
              <div className={`${bmiData.bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-100`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-2 ${bmiData.bgColor} rounded-lg`}>
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${bmiData.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">BMI</p>
                    <p className={`text-lg sm:text-xl font-bold ${bmiData.color}`}>{bmiData.value}</p>
                    <p className={`text-[10px] sm:text-xs font-medium ${bmiData.color}`}>{bmiData.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Form Card */}
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="h-1 bg-gray-100 w-full">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                style={{ width: activeTab === 'basics' ? '50%' : '100%' }}
              />
            </div>

            <div className="w-full p-4 sm:p-6 lg:p-8">
              {activeTab === 'basics' ? (
                /* Basics Tab - with backend field names */
                <div className="w-full space-y-6">
                  <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Height */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Ruler className="w-4 h-4 text-amber-500" />
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height_cm || ''}
                        onChange={e => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="170"
                        required
                      />
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Weight className="w-4 h-4 text-amber-500" />
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight_kg || ''}
                        onChange={e => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="70"
                        required
                      />
                    </div>

                    {/* Waist (Optional) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Target className="w-4 h-4 text-amber-500" />
                        Waist Circumference <span className="text-xs text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.waist_cm || ''}
                        onChange={e => setFormData({ ...formData, waist_cm: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="Optional"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        Age
                      </label>
                      <input
                        type="number"
                        value={formData.age || ''}
                        onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="25"
                        required
                      />
                    </div>

                    {/* Sex */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 text-amber-500" />
                        Sex
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sex: 'male' })}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                            formData.sex === 'male'
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, sex: 'female' })}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                            formData.sex === 'female'
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-3 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Flame className="w-4 h-4 text-amber-500" />
                          Activity Level
                        </label>
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                          {activityLabels[formData.activity_level || 1]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={formData.activity_level ?? 1}
                        onChange={e => setFormData({ ...formData, activity_level: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="w-full flex justify-between text-[10px] sm:text-xs text-gray-500 font-medium">
                        {activityLabels.map((label, i) => (
                          <span key={i} className="text-center">{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('conditions')}
                    className="w-full sm:w-auto mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    Next: Health Conditions
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                /* Conditions Tab - with backend field names */
                <div className="w-full space-y-6">
                  <div className="w-full flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Select any health conditions that apply. This helps us personalize your nutrition plan.
                    </p>
                  </div>

                  <div className="w-full space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(COMMON_CONDITIONS).map(([category, conditions]) => (
                      <div key={category} className="w-full border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-medium transition-colors"
                        >
                          <span className="text-gray-700">{category}</span>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedCategories.includes(category) ? 'rotate-90' : ''
                          }`} />
                        </button>
                        
                        {expandedCategories.includes(category) && (
                          <div className="w-full p-3 space-y-2">
                            {conditions.map(condition => {
                              const isActive = formData.medical_conditions?.includes(condition);
                              return (
                                <button
                                  key={condition}
                                  type="button"
                                  onClick={() => toggleCondition(condition)}
                                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                                    isActive
                                      ? condition === 'None / Not Applicable'
                                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500'
                                        : 'bg-amber-50 text-amber-700 border-2 border-amber-500'
                                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-amber-300'
                                  }`}
                                >
                                  <span>{condition}</span>
                                  {isActive && (
                                    <CheckCircle2 className={`w-5 h-5 ${
                                      condition === 'None / Not Applicable' ? 'text-emerald-500' : 'text-amber-500'
                                    }`} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="w-full space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="manual_condition"
                        checked={showManualInput}
                        onChange={(e) => {
                          setShowManualInput(e.target.checked);
                          if (!e.target.checked) setFormData(prev => ({ ...prev, other_medical_condition: '' }));
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="manual_condition" className="text-sm font-medium text-gray-700">
                        Add condition not listed
                      </label>
                    </div>

                    {showManualInput && (
                      <input
                        type="text"
                        value={formData.other_medical_condition || ''}
                        onChange={e => setFormData({ ...formData, other_medical_condition: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g., PCOS, Hypothyroidism..."
                      />
                    )}
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('basics')}
                      className="w-full sm:w-auto cursor-pointer px-6 py-3 border-2 border-gray-200 hover:border-amber-500 text-gray-700 font-medium rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:flex-1 cursor-pointer px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Health Profile
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Anthropometric;