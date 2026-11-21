'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AQICard } from '@/components/AQICard';
import { ForecastChart } from '@/components/ForecastChart';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { DailyPlanView } from '@/components/DailyPlanView';
import { OnboardingModal } from '@/components/OnboardingModal';
import { IAQCoachView } from '@/components/IAQCoachView';
import { SustainableAlternativesView } from '@/components/SustainableAlternativesView';
import { AskAssistantView } from '@/components/AskAssistantView';
import { CommunityModeView } from '@/components/CommunityModeView';
import { AlertsCenter } from '@/components/AlertsCenter';
import { Navigation, NavTab } from '@/components/Navigation';
import { AQIData } from '@/lib/aqi/types';
import { MockAQIProvider } from '@/lib/aqi/mock-provider';
import { HouseholdProfile, DEFAULT_PROFILE } from '@/lib/profile/types';
import { getStoredProfile, saveProfile, deleteStoredProfile, exportProfileJSON } from '@/lib/profile/store';
import { generateRulesBasedPlan } from '@/lib/plan/rules-engine';
import { DailyPlan } from '@/lib/plan/types';
import { useI18n } from '@/lib/i18n/context';

export default function HomePage() {
  const { t, isHindi } = useI18n();
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [mockScenario, setMockScenario] = useState<string>('delhi_severe');
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_PROFILE);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Register service worker for PWA offline capabilities
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  // Load saved profile from localStorage
  useEffect(() => {
    const loaded = getStoredProfile();
    setProfile(loaded);
  }, []);

  // Load AQI Data from API route or fallback
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/aqi?scenario=${mockScenario}&mock=true`);
        if (res.ok) {
          const data = await res.json();
          setAqiData(data);
        } else {
          const provider = new MockAQIProvider(mockScenario);
          const fallback = await provider.getAQI();
          setAqiData(fallback);
        }
      } catch {
        const provider = new MockAQIProvider(mockScenario);
        const fallback = await provider.getAQI();
        setAqiData(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [mockScenario]);

  // Recalculate plan when profile or aqiData changes
  useEffect(() => {
    if (aqiData) {
      const plan = generateRulesBasedPlan(profile, aqiData);
      setDailyPlan(plan);
    }
  }, [profile, aqiData]);

  const handleProfileUpdate = (newProfile: HouseholdProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleDeleteData = () => {
    if (window.confirm(t.settings.confirmDelete)) {
      deleteStoredProfile();
      setProfile(DEFAULT_PROFILE);
      alert(isHindi ? 'आपका सारा डेटा सफलतापूर्वक मिटा दिया गया है।' : 'All local profile data deleted successfully.');
      setIsOnboardingOpen(true);
    }
  };

  const handleExportData = () => {
    const jsonStr = exportProfileJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleanbreath-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 text-slate-900">
      <Header 
        mockScenario={mockScenario}
        onScenarioChange={(sc) => setMockScenario(sc)}
        onOpenSettings={() => setActiveTab('settings')}
      />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        <MedicalDisclaimer />

        {isLoading || !aqiData ? (
          <div className="animate-pulse space-y-4">
            <div className="h-44 bg-slate-200 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 rounded-2xl"></div>
          </div>
        ) : (
          <>
            {/* 1. TODAY'S PLAN TAB */}
            {activeTab === 'today' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <AQICard data={aqiData} />
                <ForecastChart forecast={aqiData.forecast72h} />
                {dailyPlan && (
                  <DailyPlanView
                    plan={dailyPlan}
                    profile={profile}
                    onOpenOnboarding={() => setIsOnboardingOpen(true)}
                  />
                )}
              </div>
            )}

            {/* 2. IAQ COACH TAB */}
            {activeTab === 'iaq' && (
              <div className="animate-in fade-in duration-200">
                <IAQCoachView aqiData={aqiData} profile={profile} />
              </div>
            )}

            {/* 3. SUSTAINABLE ALTERNATIVES / SWAPS TAB */}
            {activeTab === 'alternatives' && (
              <div className="animate-in fade-in duration-200">
                <SustainableAlternativesView profile={profile} />
              </div>
            )}

            {/* 4. ASK CLEANBREATH CHAT TAB */}
            {activeTab === 'ask' && (
              <div className="animate-in fade-in duration-200">
                <AskAssistantView profile={profile} aqiData={aqiData} />
              </div>
            )}

            {/* 5. COMMUNITY MODE TAB */}
            {activeTab === 'community' && (
              <div className="animate-in fade-in duration-200">
                <CommunityModeView aqiData={aqiData} profile={profile} />
              </div>
            )}

            {/* 6. SETTINGS & ALERTS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <AlertsCenter aqiData={aqiData} />

                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                  <h2 className="text-base font-bold text-slate-900">
                    {t.settings.title}
                  </h2>
                  
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-800">
                      {t.settings.dataPrivacy}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isHindi 
                        ? 'क्लीनब्रीथ गोपनीयता-प्रथम सिद्धांत पर काम करता है। आपका डेटा कभी किसी सर्वर पर नहीं बेचा या भेजा जाता। यह केवल आपके इस ब्राउज़र में सुरक्षित रहता है।' 
                        : 'CleanBreath operates strictly on a local-first privacy model. Your profile and health settings reside on your device and are never sold or synced without consent.'}
                    </p>
                    
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleExportData}
                        className="px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-300 transition-colors"
                      >
                        {t.settings.exportData}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteData}
                        className="px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-300 transition-colors"
                      >
                        {t.settings.deleteData}
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                    <h3 className="text-xs font-bold text-slate-800">
                      {isHindi ? 'प्रोफ़ाइल संशोधन' : 'Profile & Household Configuration'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {isHindi 
                        ? 'अपने परिवार, घर या यात्रा की जानकारी कभी भी अपडेट करें।' 
                        : 'Update family members, children, commute modes, or home ventilation anytime.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsOnboardingOpen(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
                    >
                      {isHindi ? 'ऑनबोर्डिंग फॉर्म दोबारा खोलें' : 'Re-open Onboarding Setup'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onProfileUpdated={handleProfileUpdate}
        initialProfile={profile}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
