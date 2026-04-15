// src/components/Subscription.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../../auth/useAuth";
import { toast } from "sonner";
import { Loader2, Check, Phone, XCircle, AlertTriangle, Calendar } from "lucide-react";
import { SubscriptionTier } from "../../../constants/subscriptionTier";

const Subscription = ({
  currentTier: initialTier,
  onUpgrade: parentOnUpgrade,
}) => {
  const { token, apiBaseURL } = useAuth();

  const [tiers, setTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState(
    initialTier || SubscriptionTier.FREE,
  );
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & payment states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("phone");
  const [pendingTier, setPendingTier] = useState(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  // Downgrade warning modal
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);

  // Periodic refresh ref
  const refreshIntervalRef = useRef(null);

  // ==================== FETCH PROFILE ====================
  const fetchCurrentTier = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseURL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();

        // Support all possible field name variants from the backend
        let serverTier =
          data.tier ||
          data.effective_tier ||
          data.subscription_tier ||
          data.subscriptionTier ||
          initialTier;

        const expiresStr =
          data.subscription_expires_at ||
          data.expires_at ||
          data.subscriptionExpiresAt;

        let expDate = null;

        if (expiresStr) {
          const parsed = new Date(expiresStr);
          if (!isNaN(parsed.getTime())) {
            expDate = parsed;

            // Client-side expiry guard: if already past, force FREE and tell backend
            if (expDate < new Date() && serverTier !== SubscriptionTier.FREE) {
              serverTier = SubscriptionTier.FREE;
              expDate = null;
              fetch(`${apiBaseURL}/update-subscription/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tier: SubscriptionTier.FREE }),
              }).catch((e) => console.warn("Auto-downgrade sync failed", e));
            }
          } else {
            console.warn("Invalid expiry date from backend:", expiresStr);
          }
        } else if (serverTier !== SubscriptionTier.FREE) {
          // Paid tier but no expiry returned — warn so backend can be fixed
          console.warn(
            "Paid plan has no expiry date from backend. Ensure /profile/ returns subscription_expires_at.",
          );
        }

        setCurrentTier(serverTier);
        setExpiresAt(expDate);
      }
    } catch (e) {
      console.warn("Could not fetch current tier", e);
    }
  }, [token, apiBaseURL, initialTier]);

  // Initial fetch
  useEffect(() => {
    fetchCurrentTier();
  }, [fetchCurrentTier]);

  // Re-fetch when tab regains focus (catches admin-side changes)
  useEffect(() => {
    const handleFocus = () => fetchCurrentTier();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchCurrentTier]);

  //  Periodic refresh every 60 seconds so admin-applied tiers & expiry dates
  //    show up automatically without requiring the user to reload
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      fetchCurrentTier();
    }, 60_000);
    return () => clearInterval(refreshIntervalRef.current);
  }, [fetchCurrentTier]);

  // ==================== FETCH PLANS ====================
  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseURL}/subscription-plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((t) => ({
            id: t.name,
            name:
              t.display_name ||
              t.name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            price:
              t.price === "0" || t.price === 0 || t.price === "0.00"
                ? "Ksh 0"
                : `Ksh ${t.price}/mo`,
            features: Array.isArray(t.features)
              ? t.features
              : Object.values(t.features || {}),
            color:
              t.name === SubscriptionTier.FREE
                ? "slate"
                : t.name === SubscriptionTier.PRO_LITE
                  ? "amber"
                  : "orange",
          }));
          setTiers(mapped);
        } else {
          toast.error("Failed to load subscription plans");
        }
      } catch (err) {
        console.error("Plans fetch error:", err);
        toast.error("Could not load plans – using offline fallback");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token, apiBaseURL]);

  // ==================== COUNTDOWN TIMER ====================
  useEffect(() => {
    let timer;
    if (modalMode === "waiting" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && modalMode === "waiting") {
      setModalMode("failed");
      setErrorMessage("Payment timed out. Please try again.");
      setIsPolling(false);
    }
    return () => clearInterval(timer);
  }, [modalMode, timeLeft]);

  // ==================== DIRECT UPGRADE (FREE only) ====================
  const handleDirectUpgrade = async (tierId) => {
    if (!token) {
      toast.error("Please log in to change plan");
      return;
    }

    try {
      const res = await fetch(`${apiBaseURL}/update-subscription/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: tierId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentTier(data.new_tier);
        setExpiresAt(
          data.new_tier === SubscriptionTier.FREE
            ? null
            : data.subscription_expires_at
              ? new Date(data.subscription_expires_at)
              : null,
        );
        toast.success(`Switched to ${data.new_tier}`);
        if (parentOnUpgrade) parentOnUpgrade(data.new_tier);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
    } catch (err) {
      toast.error(err.message || "Could not update plan");
    }
  };

  // ==================== M-PESA / DOWNGRADE FLOW ====================
  const initiateMpesaUpgrade = (tierId) => {
    if (!token) {
      toast.error("Please log in to change plan");
      return;
    }

    if (tierId === SubscriptionTier.FREE) {
      const isPaid = currentTier !== SubscriptionTier.FREE;
      const isActive = !expiresAt || expiresAt > new Date();
      if (isPaid && isActive) {
        setShowDowngradeWarning(true);
        return;
      }
      handleDirectUpgrade(tierId);
      return;
    }

    setPendingTier(tierId);
    setPhoneInput("");
    setModalMode("phone");
    setTimeLeft(180);
    setShowModal(true);
    setErrorMessage("");
  };

  // ==================== M-PESA PAYMENT FLOW ====================
  const sendMpesaPrompt = async () => {
    if (!phoneInput) return;

    setModalMode("sending");

    try {
      const res = await fetch(`${apiBaseURL}/mpesa/stk-push/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: pendingTier,
          phone_number: phoneInput,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCheckoutRequestId(data.checkout_request_id);
        setModalMode("waiting");
        setTimeLeft(180);
        startPolling(data.checkout_request_id);
      } else {
        setErrorMessage(data.error || "Failed to send M-Pesa prompt");
        setModalMode("failed");
      }
    } catch (err) {
      setErrorMessage("Network error – please try again");
      setModalMode("failed");
    }
  };

  const startPolling = (checkoutId) => {
    if (isPolling) return;
    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBaseURL}/mpesa/status/${checkoutId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === "SUCCESS") {
          clearInterval(interval);
          setIsPolling(false);
          // Re-fetch profile so expiry date is pulled from backend
          await fetchCurrentTier();
          if (parentOnUpgrade) parentOnUpgrade(pendingTier);
          setModalMode("success");
        } else if (data.status === "FAILED") {
          clearInterval(interval);
          setIsPolling(false);
          setModalMode("failed");
          setErrorMessage(data.message || "Payment was declined or timed out.");
        }
      } catch (e) {}
    }, 3500);

    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
    }, 185000);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode("phone");
    setPendingTier(null);
    setCheckoutRequestId(null);
    setErrorMessage("");
    setTimeLeft(180);
  };

  const retryPayment = () => {
    setModalMode("phone");
    setErrorMessage("");
    setTimeLeft(180);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // ==================== EXPIRY LABEL HELPER ====================
  // Shared helper so M-Pesa payments and admin-applied tiers
  // both render the same "Active • until DD Mon YYYY" format
  const getExpiryLabel = (tierId) => {
    if (tierId === SubscriptionTier.FREE) return null;
    if (!expiresAt || isNaN(expiresAt.getTime())) return null;
    return expiresAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==================== STYLING HELPERS ====================
  const getTierCardClasses = (tier, isActive) => {
    const base =
      "p-6 rounded-3xl border-2 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 shadow-xl group";
    if (!isActive)
      return `${base} border-amber-200/50 bg-white/60 hover:border-amber-200/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]`;

    switch (tier.id) {
      case SubscriptionTier.PREMIUM:
        return `${base} border-orange-300 bg-gradient-to-br from-orange-50/80 to-orange-100/40 shadow-orange-200/30`;
      case SubscriptionTier.PRO_LITE:
        return `${base} border-amber-300 bg-gradient-to-br from-amber-50/80 to-amber-100/40 shadow-amber-200/30`;
      default:
        return `${base} border-slate-300 bg-gradient-to-br from-slate-50/80 to-slate-100/40 shadow-slate-200/30`;
    }
  };

  const getPriceColor = (tierId) => {
    switch (tierId) {
      case SubscriptionTier.PREMIUM:
        return "text-orange-600";
      case SubscriptionTier.PRO_LITE:
        return "text-amber-600";
      default:
        return "text-slate-600";
    }
  };

  const getActiveBadgeClasses = (tierId) => {
    const base =
      "text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse";
    switch (tierId) {
      case SubscriptionTier.PREMIUM:
        return `${base} bg-gradient-to-r from-orange-500 to-amber-500`;
      case SubscriptionTier.PRO_LITE:
        return `${base} bg-gradient-to-r from-amber-500 to-orange-500`;
      default:
        return `${base} bg-gradient-to-r from-slate-500 to-slate-600`;
    }
  };

  const getButtonClasses = (tierId) => {
    const base =
      "w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95";
    switch (tierId) {
      case SubscriptionTier.PREMIUM:
        return `${base} bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg cursor-pointer`;
      case SubscriptionTier.PRO_LITE:
        return `${base} bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg`;
      default:
        return `${base} bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 cursor-pointer`;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="w-full space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="w-full bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800">
                  Your
                  <span className="block sm:inline sm:ml-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Subscription
                  </span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                  Choose the best plan for your nutrition goals.
                </p>
              </div>
            </div>
          </header>

          {/* Plans */}
          <div className="space-y-4">
            {tiers.map((tier, idx) => {
              const isActive = currentTier === tier.id;
              const features = Array.isArray(tier.features) ? tier.features : [];
              const expiryLabel = getExpiryLabel(tier.id);

              return (
                <div
                  key={tier.id}
                  className={getTierCardClasses(tier, isActive)}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-2xl text-slate-800">
                        {tier.name}
                      </h3>
                      <p className={`text-2xl font-black ${getPriceColor(tier.id)} mt-1`}>
                        {tier.price}
                      </p>
                    </div>

                    {/*  Badge: always shows expiry when available, for both
                        M-Pesa payments and admin-applied subscriptions */}
                    {isActive && (
                      <div className="flex flex-col items-end gap-1">
                        <span className={getActiveBadgeClasses(tier.id)}>
                          Active
                        </span>
                        {expiryLabel && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            until {expiryLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {features.map((f, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-3 text-sm font-medium ${
                          isActive ? `text-${tier.color}-700` : "text-slate-600"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center bg-${tier.color}-100`}
                        >
                          <Check className={`h-3 w-3 text-${tier.color}-600`} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {!isActive ? (
                    <button
                      onClick={() => initiateMpesaUpgrade(tier.id)}
                      className={getButtonClasses(tier.id)}
                    >
                      {tier.id === SubscriptionTier.FREE
                        ? "Switch to Free"
                        : "Upgrade via M-Pesa"}
                    </button>
                  ) : (
                    <div className="w-full py-4 px-4 rounded-2xl bg-white/40 text-center font-black text-[10px] text-slate-600 uppercase tracking-widest border-2 border-amber-200">
                      Your Current Plan
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* M-Pesa banner */}
          <div className="bg-gradient-to-br from-amber-100/50 to-orange-100/30 p-6 rounded-3xl flex items-center gap-4 border border-amber-200/50">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-amber-100">
              <Phone className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
                M-Pesa Integration
              </p>
              <p className="text-[10px] text-slate-600">
                Pay securely with STK Push • Instant activation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAYMENT MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl transform transition-all">
            <div className="p-8">
              {modalMode === "phone" && (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    Complete your upgrade
                  </h3>
                  <p className="text-slate-600 mb-8">
                    Enter your M-Pesa registered number
                    <br />
                    <span className="text-xs">(e.g. 0712345678)</span>
                  </p>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="0712345678"
                    className="w-full border-2 border-amber-200 focus:border-amber-500 rounded-2xl px-6 py-5 text-xl font-medium outline-none transition-colors"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-4 mt-10">
                    <button
                      onClick={closeModal}
                      className="py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendMpesaPrompt}
                      disabled={!phoneInput || phoneInput.length < 9}
                      className="py-4 bg-gradient-to-r from-orange-600 to-amber-600 cursor-pointer disabled:from-slate-300 disabled:to-slate-400 text-white font-black rounded-2xl hover:scale-[1.02] transition-all disabled:cursor-not-allowed"
                    >
                      Send M-Pesa Prompt
                    </button>
                  </div>
                </>
              )}

              {modalMode === "sending" && (
                <div className="text-center py-16">
                  <Loader2 className="w-12 h-12 mx-auto text-amber-600 animate-spin" />
                  <p className="mt-6 font-medium text-slate-700">
                    Sending M-Pesa prompt...
                  </p>
                </div>
              )}

              {modalMode === "waiting" && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto text-amber-600 animate-spin" />
                  <p className="mt-6 font-semibold text-lg text-slate-800">
                    Waiting for your payment
                  </p>
                  <p className="text-slate-600 mt-2">
                    Check your phone and enter PIN
                  </p>
                  <p className="text-5xl font-mono font-bold text-amber-600 mt-10 tracking-widest">
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Time remaining</p>
                </div>
              )}

              {modalMode === "failed" && (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <p className="font-bold text-xl text-slate-800 mb-2">
                    Payment Failed
                  </p>
                  <p className="text-slate-600 mb-8">{errorMessage}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={retryPayment}
                      className="flex-1 py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {modalMode === "success" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="font-bold text-xl text-slate-800 mb-2">
                    Payment Successful
                  </p>
                  <p className="text-slate-600 mb-8">
                    Your subscription has been activated.
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== DOWNGRADE TO FREE WARNING MODAL ==================== */}
      {showDowngradeWarning && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-red-700">
                  Warning: Downgrade to Free
                </h3>
              </div>

              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Your current{" "}
                  <span className="font-semibold text-slate-800">
                    {currentTier}
                  </span>{" "}
                  subscription is active until{" "}
                  {expiresAt && !isNaN(expiresAt.getTime()) ? (
                    <span className="font-semibold text-amber-600">
                      {expiresAt.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-600">
                      an unknown date
                    </span>
                  )}
                  .
                </p>

                <p className="font-medium text-red-600">
                  Switching to Free will immediately cancel your paid access and
                  you will lose all premium features right away.
                </p>

                <p>
                  This action{" "}
                  <span className="font-medium">cannot be undone</span> without
                  making a new payment.
                </p>

                <div className="text-xs bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  Note: Your subscription would automatically revert to Free
                  when the current paid period ends anyway.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button
                  onClick={() => setShowDowngradeWarning(false)}
                  className="py-4 border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDowngradeWarning(false);
                    handleDirectUpgrade(SubscriptionTier.FREE);
                  }}
                  className="py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all cursor-pointer"
                >
                  Yes, Switch to Free
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;