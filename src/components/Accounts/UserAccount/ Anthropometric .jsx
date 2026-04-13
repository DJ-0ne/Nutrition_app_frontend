import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Ruler,
  Weight,
  Activity,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Target,
  Flame,
  Menu,
  X,
  Phone,
  Mail,
  Send,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../auth/authtoken";

const COMMON_CONDITIONS = {
  None: ["None / No Condition Applicable"],
  Metabolic: [
    "Diabetes Type 2",
    "Diabetes Type 1",
    "High Cholesterol",
    "Thyroid Disorder",
  ],
  Cardiovascular: ["Hypertension", "Heart Disease"],
  Respiratory: ["Asthma"],
  Musculoskeletal: ["Arthritis", "Back Pain"],
  Reproductive: ["PCOS", "Endometriosis"],
  Autoimmune: ["Autoimmune Disease", "Rheumatoid Arthritis", "Lupus"],
  "Mental Health": ["Depression/Anxiety"],
  Digestive: ["IBS/GI Issues", "GERD", "Celiac Disease"],
  Other: [
    "Migraines",
    "Cancer (in remission)",
    "Kidney Disease",
    "Liver Disease",
    "Eating Disorder History",
  ],
};

const ACTIVITY_LABELS = [
  "Sedentary",
  "Light",
  "Moderate",
  "Active",
  "Very Active",
  "Athlete",
];

// ─── Consultation Modal ───────────────────────────────────────────────────────
const ConsultationModal = ({ isOpen, onClose, onSubmit, isSending }) => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.preferred_date) {
      toast.error("Please fill in your name, email and preferred date.");
      return;
    }
    onSubmit(form);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    // ── backdrop ──────────────────────────────────────────────────────────
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
      {/* ── modal card ── */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
        {/* header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Book Expert Consultation
            </h2>
            <p className="text-amber-100 text-sm mt-0.5">
              We'll reach out to confirm your appointment
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-2 hover:bg-amber-800/40 rounded-xl transition-colors text-white disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4 text-amber-500" /> Full Name{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Jane Mwangi"
              disabled={isSending}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none disabled:opacity-50"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 text-amber-500" /> Email Address{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. jane@example.com"
              disabled={isSending}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none disabled:opacity-50"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 text-amber-500" /> Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +254 712 345 678"
              disabled={isSending}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none disabled:opacity-50"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-amber-500" /> Preferred Date{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="preferred_date"
                value={form.preferred_date}
                min={today}
                onChange={handleChange}
                disabled={isSending}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none disabled:opacity-50"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-amber-500" /> Preferred Time
              </label>
              <select
                name="preferred_time"
                value={form.preferred_time}
                onChange={handleChange}
                disabled={isSending}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none disabled:opacity-50 text-gray-700"
              >
                <option value="">Select a time</option>
                <optgroup label="Morning">
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="7:30 AM">7:30 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="8:30 AM">8:30 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="9:30 AM">9:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                </optgroup>
                <optgroup label="Afternoon">
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                </optgroup>
                <optgroup label="Evening">
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Additional Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any specific concerns or topics you'd like to discuss..."
              rows={3}
              disabled={isSending}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-5 py-3 border-2 border-gray-200 hover:border-amber-400 text-gray-700 font-medium rounded-xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Anthropometric = ({ onSave = () => {} }) => {
  const { token, apiBaseURL } = useAuth();
  const [activeTab, setActiveTab] = useState("basics");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    height_cm: null,
    weight_kg: null,
    age: null,
    sex: "",
    waist_cm: null,
    medical_conditions: [],
    other_medical_condition: "",
    activity_level: null,
    smoking_status: "",
    alcohol_consumption: "",
  });

  const [showManualInput, setShowManualInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(["None"]);

  // Consultation modal state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [isSendingConsultation, setIsSendingConsultation] = useState(false);

  // Fetch existing profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseURL}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            height_cm: data.height_cm ?? null,
            weight_kg: data.weight_kg ?? null,
            age: data.age ?? null,
            sex: data.sex || "",
            waist_cm: data.waist_cm ?? null,
            medical_conditions: data.medical_conditions || [],
            other_medical_condition: data.other_medical_condition || "",
            activity_level: data.activity_level ?? null,
            smoking_status: data.smoking_status || "",
            alcohol_consumption: data.alcohol_consumption || "",
          });

          if (data.other_medical_condition) {
            setShowManualInput(true);
          }
        } else if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, apiBaseURL]);

  useEffect(() => {
    if (!loading && formData.activity_level === null) {
      setFormData((prev) => ({ ...prev, activity_level: 1 }));
    }
  }, [loading]);

  const bmiData = useMemo(() => {
    if (!formData.height_cm || !formData.weight_kg) return null;
    const hM = formData.height_cm / 100;
    const bmi = formData.weight_kg / (hM * hM);
    let status, color, bgColor;

    if (bmi < 18.5) {
      status = "Underweight";
      color = "text-amber-600";
      bgColor = "bg-amber-50";
    } else if (bmi < 25) {
      status = "Healthy";
      color = "text-emerald-600";
      bgColor = "bg-emerald-50";
    } else if (bmi < 30) {
      status = "Overweight";
      color = "text-amber-600";
      bgColor = "bg-amber-50";
    } else {
      status = "Obesity";
      color = "text-orange-600";
      bgColor = "bg-orange-50";
    }

    return { value: bmi.toFixed(1), status, color, bgColor };
  }, [formData.height_cm, formData.weight_kg]);

  const bmrData = useMemo(() => {
    if (!formData.weight_kg || !formData.age || !formData.sex) return null;
    const w = Number(formData.weight_kg);
    const h = Number(formData.height_cm || 0);
    const a = Number(formData.age);
    const sex = formData.sex;

    let bmr;
    if (a >= 20) {
      if (!formData.height_cm) return null;
      bmr =
        sex === "male"
          ? 13.397 * w + 4.799 * h - 5.677 * a + 88.362
          : 9.247 * w + 3.098 * h - 4.33 * a + 447.593;
    } else if (a >= 18) {
      bmr = sex === "male" ? 15.057 * w + 692.2 : 14.818 * w + 486.6;
    } else if (a >= 10) {
      bmr = sex === "male" ? 17.686 * w + 658.2 : 13.384 * w + 692.6;
    } else if (a >= 3) {
      bmr = sex === "male" ? 22.706 * w + 504.3 : 20.315 * w + 485.9;
    } else {
      bmr = sex === "male" ? 59.512 * w - 30.4 : 58.317 * w - 31.1;
    }

    if (!bmr || isNaN(bmr)) return null;
    return Math.round(bmr);
  }, [formData.weight_kg, formData.height_cm, formData.age, formData.sex]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleCondition = (condition) => {
    let current = formData.medical_conditions || [];

    if (condition === "None / No Condition Applicable") {
      if (!current.includes("None / No Condition Applicable")) {
        setFormData({
          ...formData,
          medical_conditions: ["None / No Condition Applicable"],
          other_medical_condition: "",
        });
        setShowManualInput(false);
      } else {
        setFormData({ ...formData, medical_conditions: [] });
      }
      return;
    }

    if (current.includes("None / No Condition Applicable")) {
      current = [];
    }

    if (current.includes(condition)) {
      setFormData({
        ...formData,
        medical_conditions: current.filter((c) => c !== condition),
      });
    } else {
      setFormData({ ...formData, medical_conditions: [...current, condition] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.medical_conditions ||
      formData.medical_conditions.length === 0
    ) {
      toast.error("Please indicate your health conditions");
      setActiveTab("conditions");
      return;
    }

    if (
      !formData.height_cm ||
      !formData.weight_kg ||
      !formData.age ||
      !formData.sex ||
      formData.activity_level == null
    ) {
      toast.error(
        "Please fill all required fields. Check the activity level slider",
      );
      return;
    }

    if (!token) {
      toast.error("Please login first");
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
        other_medical_condition: formData.other_medical_condition || "",
        activity_level: formData.activity_level,
        smoking_status: formData.smoking_status,
        alcohol_consumption: formData.alcohol_consumption,
      };

      const response = await fetch(`${apiBaseURL}/profile/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          return;
        }
        const error = await response.json();
        throw new Error(error.message || "Failed to save profile");
      }

      const savedData = await response.json();
      toast.success("Profile saved successfully!");
      onSave(savedData);
    } catch (err) {
      toast.error(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Consultation submit handler ──────────────────────────────────────────
  const handleBookConsultation = async (consultationForm) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setIsSendingConsultation(true);
    try {
      const response = await fetch(`${apiBaseURL}/book-consultation/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationForm),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to send consultation request");
      }

      setShowConsultationModal(false);
      toast.success(
        "Consultation request sent! Our team will contact you soon.",
      );
    } catch (err) {
      toast.error("Failed to send consultation request. Please try again.");
    } finally {
      setIsSendingConsultation(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  const currentActivityLevel = formData.activity_level ?? 1;
  const activityLabel = ACTIVITY_LABELS[currentActivityLevel];
  const activityClass =
    formData.activity_level != null
      ? "text-amber-600 bg-amber-50"
      : "text-gray-500 bg-gray-50";

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() =>
          !isSendingConsultation && setShowConsultationModal(false)
        }
        onSubmit={handleBookConsultation}
        isSending={isSendingConsultation}
      />

      {/* Header */}
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
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
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
                {["basics", "conditions"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-white text-amber-700 shadow-lg"
                        : "text-amber-100 hover:bg-amber-800/40"
                    }`}
                  >
                    {tab === "basics" ? "Basics" : "Health"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="hidden lg:flex gap-2 bg-amber-800/30 p-1 rounded-xl w-fit mt-4">
            {["basics", "conditions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-white text-amber-700 shadow-lg"
                    : "text-amber-100 hover:bg-amber-800/40"
                }`}
              >
                {tab === "basics" ? "Basics" : "Health"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="w-full max-w-[2000px] mx-auto">
          {/* Quick Stats Cards */}
          <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              {
                icon: (
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                ),
                label: "Height",
                value: `${formData.height_cm || "—"} cm`,
              },
              {
                icon: (
                  <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                ),
                label: "Weight",
                value: `${formData.weight_kg || "—"} kg`,
              },
              {
                icon: <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />,
                label: "Age/Sex",
                value: `${formData.age || "—"} / ${formData.sex ? formData.sex.charAt(0).toUpperCase() : "—"}`,
              },
              {
                icon: (
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                ),
                label: "BMR",
                value: bmrData ? `${bmrData}` : "—",
                sub: bmrData ? "kcal/day" : null,
              },
            ].map(({ icon, label, value, sub }) => (
              <div
                key={label}
                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-amber-100"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">{icon}</div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">
                      {value}
                    </p>
                    {sub && (
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {sub}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Form Card */}
          <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="h-1 bg-gray-100 w-full">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                style={{ width: activeTab === "basics" ? "50%" : "100%" }}
              />
            </div>

            <div className="w-full p-4 sm:p-6 lg:p-8">
              {activeTab === "basics" ? (
                <div className="w-full space-y-6">
                  <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Ruler className="w-4 h-4 text-amber-500" /> Height (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height_cm ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height_cm: Number(e.target.value) || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g. 170"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Weight className="w-4 h-4 text-amber-500" /> Weight
                        (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight_kg ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight_kg: Number(e.target.value) || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g. 70"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Target className="w-4 h-4 text-amber-500" />
                        Waist Circumference{" "}
                        <span className="text-xs text-gray-400">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.waist_cm ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            waist_cm: Number(e.target.value) || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g. 85 (optional)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 text-amber-500" /> Age
                      </label>
                      <input
                        type="number"
                        value={formData.age ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            age: Number(e.target.value) || null,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g. 25"
                        required
                      />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 text-amber-500" /> Sex
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["male", "female"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({ ...formData, sex: s })}
                            className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                              formData.sex === s
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 lg:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Flame className="w-4 h-4 text-amber-500" /> Activity
                          Level
                        </label>
                        <span
                          className={`text-sm font-bold ${activityClass} px-3 py-1 rounded-full`}
                        >
                          {activityLabel}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={currentActivityLevel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activity_level: Number(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="w-full flex justify-between text-[10px] sm:text-xs text-gray-500 font-medium">
                        {ACTIVITY_LABELS.map((label, i) => (
                          <span
                            key={i}
                            className={`text-center transition-colors ${
                              currentActivityLevel === i
                                ? "text-amber-600 font-bold"
                                : ""
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab("conditions")}
                      className="flex-1 sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      Next: Health Conditions
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowConsultationModal(true)}
                      className="flex-1 sm:w-auto px-6 py-3 border-2 border-amber-600 hover:bg-amber-50 text-amber-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Activity className="w-5 h-5" />
                      Book Expert Consultation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="w-full flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Select any health conditions that apply. This helps us
                      personalize your nutrition plan.
                    </p>
                  </div>

                  <div className="w-full space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(COMMON_CONDITIONS).map(
                      ([category, conditions]) => (
                        <div
                          key={category}
                          className="w-full border border-gray-200 rounded-xl overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left font-medium transition-colors"
                          >
                            <span className="text-gray-700">{category}</span>
                            <ChevronRight
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                expandedCategories.includes(category)
                                  ? "rotate-90"
                                  : ""
                              }`}
                            />
                          </button>

                          {expandedCategories.includes(category) && (
                            <div className="w-full p-3 space-y-2">
                              {conditions.map((condition) => {
                                const isActive =
                                  formData.medical_conditions?.includes(
                                    condition,
                                  );
                                const isNone =
                                  condition ===
                                  "None / No Condition Applicable";
                                return (
                                  <button
                                    key={condition}
                                    type="button"
                                    onClick={() => toggleCondition(condition)}
                                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                                      isActive
                                        ? isNone
                                          ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-500"
                                          : "bg-amber-50 text-amber-700 border-2 border-amber-500"
                                        : "bg-white border-2 border-gray-200 text-gray-600 hover:border-amber-300"
                                    }`}
                                  >
                                    <span>{condition}</span>
                                    {isActive && (
                                      <CheckCircle2
                                        className={`w-5 h-5 ${isNone ? "text-emerald-500" : "text-amber-500"}`}
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="w-full space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="manual_condition"
                        checked={showManualInput}
                        onChange={(e) => {
                          setShowManualInput(e.target.checked);
                          if (!e.target.checked)
                            setFormData((prev) => ({
                              ...prev,
                              other_medical_condition: "",
                            }));
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <label
                        htmlFor="manual_condition"
                        className="text-sm font-medium text-gray-700"
                      >
                        Add condition not listed
                      </label>
                    </div>

                    {showManualInput && (
                      <input
                        type="text"
                        value={formData.other_medical_condition || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            other_medical_condition: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="e.g., PCOS, Hypothyroidism..."
                      />
                    )}
                  </div>

                  <div className="w-full pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-500" />
                      Lifestyle Factors
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Smoking Status
                        </label>
                        <select
                          value={formData.smoking_status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smoking_status: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        >
                          <option value="">Select smoking status</option>
                          <option value="never">Never Smoked</option>
                          <option value="former">Former Smoker</option>
                          <option value="current">Current Smoker</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          Alcohol Consumption
                        </label>
                        <select
                          value={formData.alcohol_consumption}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alcohol_consumption: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/20 transition-all outline-none"
                        >
                          <option value="">Select alcohol consumption</option>
                          <option value="none">None</option>
                          <option value="occasional">Occasional</option>
                          <option value="moderate">Moderate</option>
                          <option value="heavy">Heavy</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("basics")}
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
