// src/components/Subscription.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { SubscriptionTier } from '../../../constants/subscriptionTier';

const Subscription = ({ currentTier: initialTier, onUpgrade: parentOnUpgrade }) => {
  const { token, apiBaseURL } = useAuth();

  const [tiers, setTiers] = useState([]);
  const [currentTier, setCurrentTier] = useState(initialTier || SubscriptionTier.FREE);
  const [loading, setLoading] = useState(true);

  // Sync current tier from parent
  useEffect(() => {
    if (initialTier) setCurrentTier(initialTier);
  }, [initialTier]);

  // Fetch current user's tier
  useEffect(() => {
    const fetchCurrentTier = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseURL}/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const serverTier = data.tier || data.subscription_tier || data.subscriptionTier || initialTier;
          if (serverTier) setCurrentTier(serverTier);
        }
      } catch (e) {
        console.warn('Could not fetch current tier');
      }
    };
    fetchCurrentTier();
  }, [token, apiBaseURL, initialTier]);

  // === ONLY SOURCE OF TRUTH: Backend (no localStorage, no duplicates) ===
  useEffect(() => {
    const fetchPlans = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseURL}/api/subscription-plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();

          // Map backend data → clean tiers (guaranteed unique because backend ensures it)
          const mapped = data.map(t => ({
            id: t.name,
            name: t.display_name || t.name.replace('_', ' ').title(),
            price: t.price === '0' || t.price === 0 || t.price === '0.00'
              ? 'Ksh 0'
              : `Ksh ${t.price}/mo`,
            features: Array.isArray(t.features)
              ? t.features
              : Object.values(t.features || {}),
            color: t.name === SubscriptionTier.FREE ? 'slate'
                 : t.name === SubscriptionTier.PRO_LITE ? 'amber'
                 : 'orange'
          }));

          setTiers(mapped);
        } else {
          toast.error('Failed to load subscription plans');
        }
      } catch (err) {
        console.error('Plans fetch error:', err);
        toast.error('Could not load plans – using offline fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [token, apiBaseURL]);

  const handleUpgrade = async (tierId) => {
    if (!token) {
      toast.error('Please log in to change plan');
      return;
    }

    try {
      const res = await fetch(`${apiBaseURL}/api/update-subscription/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: tierId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentTier(data.new_tier);
        toast.success(`Switched to ${data.new_tier}`);
        if (parentOnUpgrade) parentOnUpgrade(data.new_tier);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
    } catch (err) {
      toast.error(err.message || 'Could not update plan');
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
          <header className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200">
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

          {/* Plans from backend only */}
          <div className="space-y-4">
            {tiers.map((tier, idx) => (
              <div
                key={tier.id}
                className={`p-6 rounded-3xl border-2 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 shadow-xl group ${
                  currentTier === tier.id
                    ? `border-${tier.color}-300 bg-gradient-to-br from-${tier.color}-50/80 to-${tier.color}-100/40 shadow-xl shadow-${tier.color}-200/30`
                    : `border-amber-200/50 bg-white/60 hover:border-${tier.color}-200/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]`
                }`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-2xl text-slate-800">{tier.name}</h3>
                    <p className={`text-2xl font-black text-${tier.color}-600 mt-1`}>{tier.price}</p>
                  </div>
                  {currentTier === tier.id && (
                    <span className={`bg-gradient-to-r from-${tier.color}-500 to-${tier.color}-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse`}>
                      Active
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((f, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-3 text-sm font-medium ${
                        currentTier === tier.id ? `text-${tier.color}-700` : 'text-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-${tier.color}-100`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-${tier.color}-600`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {currentTier !== tier.id ? (
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 ${
                      tier.id === SubscriptionTier.PREMIUM
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg cursor-pointer'
                        : tier.id === SubscriptionTier.PRO_LITE
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 cursor-pointer'
                    }`}
                  >
                    {tier.id === SubscriptionTier.FREE ? 'Switch to Free' : 'Upgrade via M-Pesa'}
                  </button>
                ) : (
                  <div className="w-full py-4 px-4 rounded-2xl bg-white/40 text-center font-black text-[10px] text-slate-600 uppercase tracking-widest border-2 border-amber-200">
                    Your Current Plan
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* M-Pesa banner */}
          <div className="bg-gradient-to-br from-amber-100/50 to-orange-100/30 p-6 rounded-3xl flex items-center gap-4 border border-amber-200/50">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-amber-100">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">M-Pesa Integration</p>
              <p className="text-[10px] text-slate-600">Pay securely with STK Push • Instant activation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;