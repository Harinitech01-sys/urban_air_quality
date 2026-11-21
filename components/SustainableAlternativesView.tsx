'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { HouseholdProfile } from '@/lib/profile/types';
import { calculateCommuteSwap, calculateCookingSwap } from '@/lib/impact/calculator';
import { 
  ArrowLeftRight, 
  Sparkles, 
  Leaf, 
  Car, 
  Train, 
  Users, 
  Flame, 
  Check, 
  TrendingUp, 
  DollarSign,
  Award
} from 'lucide-react';

interface SustainableAlternativesViewProps {
  profile: HouseholdProfile;
  onPledgeSwap?: (swapId: string, isPledged: boolean) => void;
}

export interface SwapOption {
  id: string;
  title: { en: string; hi: string };
  category: 'transit' | 'cooking' | 'community' | 'heating';
  from: string;
  to: string;
  avoidedCo2KgAnnual: number;
  avoidedPmGramsAnnual: number;
  cost: 'free' | 'low' | 'investment';
  feasibility: 'High' | 'Moderate';
  description: { en: string; hi: string };
}

export const SustainableAlternativesView: React.FC<SustainableAlternativesViewProps> = ({
  profile,
  onPledgeSwap,
}) => {
  const { t, isHindi } = useI18n();
  const [pledgedSwaps, setPledgedSwaps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cleanbreath_user_pledges');
      if (saved) {
        setPledgedSwaps(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const togglePledge = (id: string) => {
    const updated = { ...pledgedSwaps, [id]: !pledgedSwaps[id] };
    setPledgedSwaps(updated);
    try {
      localStorage.setItem('cleanbreath_user_pledges', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (onPledgeSwap) {
      onPledgeSwap(id, updated[id]);
    }
  };

  // Generate personalized ranked swaps based on user's profile
  const swaps: SwapOption[] = [];

  // Commute swap
  if (profile.commute.primaryMode === 'car') {
    const carSwap = calculateCommuteSwap({
      distanceKm: 15,
      tripsPerWeek: 10,
      baselineMode: 'petrol_car',
      alternativeMode: 'metro',
    });

    swaps.push({
      id: 'swap_car_metro',
      title: {
        en: 'Switch 3 Car Commutes/Week to Metro',
        hi: 'सप्ताह में 3 दिन कार के बजाय मेट्रो से यात्रा'
      },
      category: 'transit',
      from: 'Solo Petrol Car',
      to: 'Metro / Rapid Rail',
      avoidedCo2KgAnnual: Math.round(carSwap.annualAvoidedCo2Kg * 0.6),
      avoidedPmGramsAnnual: Math.round(carSwap.annualAvoidedPmGrams * 0.6),
      cost: 'free',
      feasibility: 'High',
      description: {
        en: 'Replaces 45 km of congested driving per week. Underground stations also buffer from street-level tailpipe soot.',
        hi: 'प्रति सप्ताह 45 किमी कार यात्रा की जगह मेट्रो। भूमिगत स्टेशन सड़क के काले धुएं से भी बचाते हैं।'
      }
    });

    swaps.push({
      id: 'swap_carpool',
      title: {
        en: '2-Person Carpool for Office Commute',
        hi: 'दफ्तर यात्रा के लिए 2-व्यक्ति कारपूलिंग'
      },
      category: 'transit',
      from: 'Single-Occupant Driving',
      to: 'Shared Office Carpool',
      avoidedCo2KgAnnual: 580,
      avoidedPmGramsAnnual: 130,
      cost: 'free',
      feasibility: 'High',
      description: {
        en: 'Splits vehicle emissions and fuel expense 50/50 while removing one vehicle entirely from morning congestion.',
        hi: 'ईंधन खर्च और उत्सर्जन को आधा करता है और सुबह के ट्रैफिक जाम से एक गाड़ी कम करता है।'
      }
    });
  } else if (profile.commute.primaryMode === 'twowheeler') {
    const bikeSwap = calculateCommuteSwap({
      distanceKm: 12,
      tripsPerWeek: 10,
      baselineMode: 'twowheeler',
      alternativeMode: 'metro',
    });

    swaps.push({
      id: 'swap_bike_metro',
      title: {
        en: 'Switch Daily Bike Commute to Metro on High AQI Days',
        hi: 'उच्च स्मॉग वाले दिनों में बाइक के बजाय मेट्रो'
      },
      category: 'transit',
      from: 'Two-Wheeler (Motorcycle)',
      to: 'Metro Transit + N95',
      avoidedCo2KgAnnual: bikeSwap.annualAvoidedCo2Kg,
      avoidedPmGramsAnnual: bikeSwap.annualAvoidedPmGrams,
      cost: 'free',
      feasibility: 'High',
      description: {
        en: 'Dramatically cuts direct tailpipe smoke inhalation while avoiding personal vehicle exhaust.',
        hi: 'सीधे साइलेंसर के धुएं में सांस लेने से बचाता है और व्यक्तिगत उत्सर्जन रोकता है।'
      }
    });
  }

  // Cooking swap
  if (profile.home.cookingFuel === 'biomass') {
    swaps.push({
      id: 'swap_biomass_clean',
      title: {
        en: 'Transition from Chulha/Wood to Induction or LPG',
        hi: 'चूल्हे/लकड़ी से बिजली के इंडक्शन या LPG पर बदलाव'
      },
      category: 'cooking',
      from: 'Biomass / Firewood / Dung',
      to: 'Induction / LPG Stove',
      avoidedCo2KgAnnual: 1020,
      avoidedPmGramsAnnual: 5980,
      cost: 'low',
      feasibility: 'High',
      description: {
        en: 'Completely eliminates lethal Carbon Monoxide build-up and cuts extreme indoor PM2.5 spikes by 88%.',
        hi: 'जानलेवा कार्बन मोनोऑक्साइड के खतरे को खत्म करता है और इनडोर PM2.5 को 88% तक घटाता है।'
      }
    });
  } else {
    swaps.push({
      id: 'swap_lpg_induction',
      title: {
        en: 'Add a 1-Burner Induction Cooktop for Boiling & Curries',
        hi: 'चाय-उबालने के लिए 1-बर्नर बिजली का इंडक्शन चूल्हा'
      },
      category: 'cooking',
      from: 'LPG Gas Flame',
      to: 'Clean Electric Induction',
      avoidedCo2KgAnnual: 150,
      avoidedPmGramsAnnual: 30,
      cost: 'low',
      feasibility: 'High',
      description: {
        en: 'Cuts kitchen nitrogen dioxide (NO2) and indoor humidity while saving cylinder refill costs.',
        hi: 'रसोई में NO2 गैस को कम करता है और गैस सिलेंडर के खर्च में बचत कराता है।'
      }
    });
  }

  // Community action swap
  swaps.push({
    id: 'swap_report_burning',
    title: {
      en: 'Zero-Tolerance Reporting for Open Waste Burning',
      hi: 'खुले कचरे व पत्तियों के जलने पर त्वरित रिपोर्टिंग'
    },
    category: 'community',
    from: 'Passive Smog Tolerance',
    to: 'Citizen Hotline / Samir App Alert',
    avoidedCo2KgAnnual: 340,
    avoidedPmGramsAnnual: 850,
    cost: 'free',
    feasibility: 'High',
    description: {
      en: 'Reporting local leaf/plastic fires douses severe localized toxic plumes before they enter neighborhood bedrooms.',
      hi: 'कचरा जलने की तुरंत रिपोर्ट करने से जहरीला धुआं घरों में फैलने से पहले ही बुझा दिया जाता है।'
    }
  });

  // Calculate cumulative pledged impact
  const totalAvoidedCo2 = swaps
    .filter(s => pledgedSwaps[s.id])
    .reduce((acc, s) => acc + s.avoidedCo2KgAnnual, 0);

  const totalAvoidedPm = swaps
    .filter(s => pledgedSwaps[s.id])
    .reduce((acc, s) => acc + s.avoidedPmGramsAnnual, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.swaps.title}</h2>
            <p className="text-xs text-slate-500">{t.swaps.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Cumulative Pledged Impact Summary Banner */}
      <section 
        aria-label="Your cumulative sustainability pledge impact"
        className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-sm"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100 block mb-1">
          {isHindi ? 'आपका वार्षिक संकल्पित प्रभाव' : 'Your Annual Pledged Impact'}
        </span>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <span className="text-3xl font-black block tracking-tight">
              {totalAvoidedCo2} kg
            </span>
            <span className="text-xs text-teal-100 font-medium">
              {isHindi ? 'बची हुई कार्बन डाईऑक्साइड (CO2)' : 'Avoided CO2 / Year'}
            </span>
          </div>
          <div>
            <span className="text-3xl font-black block tracking-tight">
              {totalAvoidedPm} g
            </span>
            <span className="text-xs text-teal-100 font-medium">
              {isHindi ? 'बचा हुआ जहरीला PM2.5' : 'Avoided PM2.5 / Year'}
            </span>
          </div>
        </div>
      </section>

      {/* Swaps Cards */}
      <div className="space-y-3">
        {swaps.map((swap) => {
          const isPledged = !!pledgedSwaps[swap.id];

          return (
            <article 
              key={swap.id}
              className={`rounded-2xl border p-4 transition-all ${
                isPledged 
                  ? 'bg-emerald-50/60 border-emerald-400 shadow-xs' 
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    {swap.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {isHindi ? swap.title.hi : swap.title.en}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => togglePledge(swap.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isPledged
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isPledged ? (isHindi ? 'संकल्पित ✓' : 'Pledged ✓') : (isHindi ? 'संकल्प लें' : 'Pledge')}</span>
                </button>
              </div>

              {/* Transition flow */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 my-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <span className="text-red-700 truncate">{swap.from}</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="text-teal-700 truncate font-bold">{swap.to}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {isHindi ? swap.description.hi : swap.description.en}
              </p>

              {/* Quantified Impact Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                <div className="bg-sky-50 p-2 rounded-lg border border-sky-200">
                  <span className="text-[10px] font-bold text-sky-800 block">
                    {isHindi ? 'बची हुई CO2:' : 'Avoided CO2:'}
                  </span>
                  <span className="text-sm font-black text-sky-950">
                    ~{swap.avoidedCo2KgAnnual} kg/yr
                  </span>
                </div>

                <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-800 block">
                    {isHindi ? 'बचा हुआ PM2.5:' : 'Avoided PM2.5:'}
                  </span>
                  <span className="text-sm font-black text-teal-950">
                    ~{swap.avoidedPmGramsAnnual} g/yr
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
