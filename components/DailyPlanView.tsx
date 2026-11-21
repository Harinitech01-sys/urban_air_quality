'use client';

import React, { useState } from 'react';
import { DailyPlan, PlanRecommendation, PlanTimeBlockId } from '@/lib/plan/types';
import { HouseholdProfile } from '@/lib/profile/types';
import { RecommendationCard } from './RecommendationCard';
import { useI18n } from '@/lib/i18n/context';
import { 
  Sparkles, 
  UserCheck, 
  SlidersHorizontal, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';

interface DailyPlanViewProps {
  plan: DailyPlan;
  profile: HouseholdProfile;
  onOpenOnboarding: () => void;
  onRefreshPlan?: () => void;
  isRefreshing?: boolean;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  plan,
  profile,
  onOpenOnboarding,
  onRefreshPlan,
  isRefreshing = false,
}) => {
  const { t, isHindi } = useI18n();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filterBlocks: { id: string; label: string }[] = [
    { id: 'all', label: isHindi ? 'सभी समय' : 'All Day' },
    { id: 'morning', label: isHindi ? 'सुबह' : 'Morning' },
    { id: 'commute', label: isHindi ? 'यात्रा' : 'Commute' },
    { id: 'school_work', label: isHindi ? 'दोपहर' : 'Midday' },
    { id: 'evening', label: isHindi ? 'शाम' : 'Evening' },
    { id: 'dinner', label: isHindi ? 'रसोई' : 'Dinner' },
    { id: 'night', label: isHindi ? 'रात' : 'Night' },
  ];

  const filteredRecs = plan.recommendations.filter((rec) => {
    if (selectedFilter === 'all') return true;
    return rec.timeBlock === selectedFilter;
  });

  return (
    <section 
      aria-label="Personalized Daily Plan"
      className="space-y-4"
    >
      {/* Profile Summary & Customization Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <h2 className="text-sm font-bold text-slate-900">
                {t.plan.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-snug">
              {isHindi ? plan.summaryNote.hi : plan.summaryNote.en}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenOnboarding}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-bold text-teal-800 bg-white hover:bg-teal-100/50 rounded-xl border border-teal-300 shadow-2xs flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isHindi ? 'प्रोफ़ाइल बदलें' : 'Personalize'}</span>
          </button>
        </div>

        {/* Profile pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-teal-200/60 text-[11px] font-semibold text-teal-950">
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-teal-200">
            📍 {profile.location.city}
          </span>
          {profile.household.hasInfants && (
            <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md border border-red-200 font-bold">
              👶 {isHindi ? 'शिशु (<2 वर्ष)' : 'Infant (<2 yrs, No masks)'}
            </span>
          )}
          {profile.household.hasElderly && (
            <span className="bg-white/80 px-2 py-0.5 rounded-md border border-teal-200">
              👵 {isHindi ? 'बुजुर्ग (65+)' : 'Elderly (65+)'}
            </span>
          )}
          {profile.household.hasRespiratoryCondition && (
            <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
              🫁 {isHindi ? 'दमा/अस्थमा' : 'Asthma / Respiratory'}
            </span>
          )}
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-teal-200">
            🛵 {isHindi ? `यात्रा: ${profile.commute.primaryMode}` : `Commute: ${profile.commute.primaryMode}`}
          </span>
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-teal-200">
            💰 {isHindi ? `बजट: ${profile.budget}` : `Budget: ${profile.budget}`}
          </span>
        </div>
      </div>

      {/* Filter Tabs by Time Block */}
      <div 
        role="tablist" 
        aria-label="Filter recommendations by time of day"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        {filterBlocks.map((block) => {
          const isSelected = selectedFilter === block.id;
          return (
            <button
              key={block.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setSelectedFilter(block.id)}
              className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {block.label}
            </button>
          );
        })}
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-3">
        {filteredRecs.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </section>
  );
};
