'use client';

import React, { useState } from 'react';
import { HouseholdProfile, DEFAULT_PROFILE, BudgetBand, CommuteMode, CookingFuel, PurifierType, DwellingType } from '@/lib/profile/types';
import { saveProfile } from '@/lib/profile/store';
import { useI18n, Language } from '@/lib/i18n/context';
import { 
  X, 
  MapPin, 
  Users, 
  Home, 
  Flame, 
  Bike, 
  DollarSign, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (profile: HouseholdProfile) => void;
  initialProfile?: HouseholdProfile;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
  initialProfile = DEFAULT_PROFILE,
}) => {
  const { language, setLanguage, t, isHindi } = useI18n();
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<HouseholdProfile>(initialProfile);
  const [activeWhy, setActiveWhy] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinish = () => {
    const updated = {
      ...profile,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updated);
    onProfileUpdated(updated);
    onClose();
  };

  const cities = [
    { name: 'New Delhi / NCR', lat: 28.6139, lon: 77.2090 },
    { name: 'Lahore', lat: 31.5204, lon: 74.3587 },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
  ];

  const whyExplains = [
    {
      title: isHindi ? 'स्थान और भाषा की जानकारी क्यों?' : 'Why location and language?',
      desc: isHindi 
        ? 'स्थान से हम आपके क्षेत्र का प्रति घंटा AQI और इनवर्जन मॉडल तय करते हैं ताकि सलाह बिल्कुल सटीक हो।' 
        : 'Location links your daily routine to local hourly inversion and traffic peaks; language renders plan in your preferred tongue.'
    },
    {
      title: isHindi ? 'परिवार के सदस्यों की जानकारी क्यों?' : 'Why household composition?',
      desc: isHindi 
        ? 'बच्चों और बुजुर्गों के फेफड़ों का आकार और सांस लेने की दर अलग होती है। शिशुओं (<2 वर्ष) को मास्क नहीं पहनाया जा सकता।' 
        : 'Children inhale 50% more air per kg of body weight than adults; infants under 2 cannot safely wear masks. Those with asthma need earlier indoor retreat thresholds.'
    },
    {
      title: isHindi ? 'घर और रसोई की जानकारी क्यों?' : 'Why home & cooking fuel?',
      desc: isHindi 
        ? 'रसोई का धुआं और खिड़कियों की दरारें घर के अंदर जहरीले कणों को 3 से 10 गुना तक बढ़ा सकती हैं।' 
        : 'Biomass cooking and unvented frying generate indoor PM2.5 exceeding 1,000 µg/m³. Knowing your setup prevents us recommending purifiers you don\'t own.'
    },
    {
      title: isHindi ? 'यात्रा और बजट की जानकारी क्यों?' : 'Why commute and budget?',
      desc: isHindi 
        ? 'बाइक सवार सीधे साइलेंसर के धुएं में होते हैं। बजट की जानकारी यह सुनिश्चित करती है कि हम पहले मुफ्त उपाय बताएं।' 
        : 'Two-wheeler and pedestrian commuters experience 4x higher PM2.5 exposure than sealed car occupants. Budget ensures we prioritize zero-cost hacks first.'
    }
  ];

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-teal-600 block">
              {isHindi ? `चरण ${step} / 4` : `Step ${step} of 4`}
            </span>
            <h2 id="onboarding-title" className="text-base font-bold text-slate-900">
              {step === 1 && (isHindi ? '1. स्थान और भाषा' : '1. Location & Language')}
              {step === 2 && (isHindi ? '2. परिवार के सदस्य' : '2. Household Members')}
              {step === 3 && (isHindi ? '3. घर और रसोई' : '3. Home & Cooking')}
              {step === 4 && (isHindi ? '4. यात्रा और बजट' : '4. Commute & Budget')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            aria-label="Close onboarding modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body By Step */}
        <div className="py-4 space-y-4">
          {/* STEP 1: LOCATION & LANGUAGE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.locationLabel}
                </label>
                <select
                  value={profile.location.city}
                  onChange={(e) => {
                    const found = cities.find(c => c.name === e.target.value);
                    if (found) {
                      setProfile({
                        ...profile,
                        location: { city: found.name, latitude: found.lat, longitude: found.lon }
                      });
                    }
                  }}
                  className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800"
                >
                  {cities.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.languageLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setProfile({ ...profile, language: 'en' });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      language === 'en'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('hi');
                      setProfile({ ...profile, language: 'hi' });
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      language === 'hi'
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HOUSEHOLD COMPOSITION */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHindi ? 'शिशु (< 2 वर्ष)' : 'Infant under 2 years?'}
                  </span>
                  <span className="text-[11px] text-red-600 font-medium">
                    {isHindi ? 'सुरक्षा नियम: शिशुओं को कभी मास्क न पहनाएं' : 'Safety rule: Infants cannot wear masks'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.household.hasInfants}
                  onChange={(e) => setProfile({
                    ...profile,
                    household: { ...profile.household, hasInfants: e.target.checked }
                  })}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHindi ? 'स्कूल जाने वाले बच्चे (3 - 17 वर्ष)' : 'School-age Children (3 - 17 yrs)?'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHindi ? 'दोपहर के खेल व स्कूल यात्रा सुरक्षा के लिए' : 'For school sports and bus/walk advice'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.household.childrenAgeBands.length > 0}
                  onChange={(e) => setProfile({
                    ...profile,
                    household: {
                      ...profile.household,
                      childrenAgeBands: e.target.checked ? ['7-12'] : []
                    }
                  })}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {t.onboarding.elderlyLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHindi ? 'सुबह की सैर का सुरक्षित समय तय करने के लिए' : 'For safe morning stroll windows'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.household.hasElderly}
                  onChange={(e) => setProfile({
                    ...profile,
                    household: { ...profile.household, hasElderly: e.target.checked }
                  })}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {t.onboarding.respiratoryLabel}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHindi ? 'दमा / अस्थमा / ब्रोंकाइटिस / हृदय रोग' : 'Asthma, COPD, chronic bronchitis, heart'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.household.hasRespiratoryCondition}
                  onChange={(e) => setProfile({
                    ...profile,
                    household: { ...profile.household, hasRespiratoryCondition: e.target.checked }
                  })}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </label>
            </div>
          )}

          {/* STEP 3: HOME & COOKING */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.purifierLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'none', label: t.onboarding.none },
                    { id: 'hepa', label: t.onboarding.hepa },
                    { id: 'diy_boxfan', label: t.onboarding.diy },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({
                        ...profile,
                        home: { ...profile.home, purifierType: opt.id as PurifierType }
                      })}
                      className={`p-2 rounded-xl border text-center font-semibold text-[11px] ${
                        profile.home.purifierType === opt.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.cookingFuel}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'lpg', label: t.onboarding.lpg },
                    { id: 'induction', label: t.onboarding.induction },
                    { id: 'biomass', label: t.onboarding.biomass },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({
                        ...profile,
                        home: { ...profile.home, cookingFuel: opt.id as CookingFuel }
                      })}
                      className={`p-2 rounded-xl border text-center font-semibold text-[11px] ${
                        profile.home.cookingFuel === opt.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {isHindi ? 'रसोई में एग्जॉस्ट फैन / चिमनी?' : 'Kitchen Exhaust Hood / Fan?'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isHindi ? 'तड़के और तेल के धुएं को बाहर निकालने के लिए' : 'Pulls cooking aerosols out before bedrooms'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.home.hasKitchenExhaust}
                  onChange={(e) => setProfile({
                    ...profile,
                    home: { ...profile.home, hasKitchenExhaust: e.target.checked }
                  })}
                  className="w-5 h-5 accent-teal-600 rounded"
                />
              </label>
            </div>
          )}

          {/* STEP 4: COMMUTE & BUDGET */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.commuteMode}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'twowheeler', label: t.onboarding.twowheeler },
                    { id: 'car', label: t.onboarding.car },
                    { id: 'metro', label: t.onboarding.metro },
                    { id: 'bus', label: t.onboarding.bus },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({
                        ...profile,
                        commute: { ...profile.commute, primaryMode: opt.id as CommuteMode }
                      })}
                      className={`p-2 rounded-xl border text-center font-semibold text-[11px] ${
                        profile.commute.primaryMode === opt.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.onboarding.budgetBand}
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'free', label: t.onboarding.budgetFree },
                    { id: 'low', label: t.onboarding.budgetLow },
                    { id: 'moderate', label: t.onboarding.budgetMed },
                    { id: 'flexible', label: t.onboarding.budgetFlexible },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({
                        ...profile,
                        budget: opt.id as BudgetBand
                      })}
                      className={`p-2 rounded-xl border text-center font-semibold text-[11px] ${
                        profile.budget === opt.id
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accordion: Why we ask this */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setActiveWhy(!activeWhy)}
              className="w-full p-2.5 flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900 text-left"
            >
              <span className="flex items-center gap-1.5 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>{whyExplains[step - 1].title}</span>
              </span>
              <span className="text-[10px] text-teal-700 underline font-bold">
                {activeWhy ? (isHindi ? 'छिपाएं' : 'Hide') : (isHindi ? 'कारण देखें' : 'Explain')}
              </span>
            </button>
            {activeWhy && (
              <div className="p-2.5 pt-0 text-[11px] text-slate-600 border-t border-slate-200 bg-white">
                {whyExplains[step - 1].desc}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5"
          >
            {t.onboarding.skip}
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? 'पीछे' : 'Back'}</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setStep(step + 1);
                  setActiveWhy(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <span>{isHindi ? 'अगला' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.onboarding.finish}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
