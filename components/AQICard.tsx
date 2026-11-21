'use client';

import React from 'react';
import { AQIData, AQICategory } from '@/lib/aqi/types';
import { useI18n } from '@/lib/i18n/context';
import { 
  CloudFog, 
  Wind, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Thermometer, 
  Droplets,
  HelpCircle
} from 'lucide-react';

interface AQICardProps {
  data: AQIData;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Color-blind safe styling with distinct iconography & borders
export const CATEGORY_STYLES: Record<AQICategory, {
  border: string;
  bg: string;
  text: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  enLabel: string;
  hiLabel: string;
}> = {
  good: {
    border: 'border-teal-600',
    bg: 'bg-teal-50',
    text: 'text-teal-950',
    badge: 'bg-teal-700 text-white',
    icon: CheckCircle2,
    enLabel: 'Good (0-50)',
    hiLabel: 'अच्छा (0-50)',
  },
  moderate: {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    badge: 'bg-amber-600 text-white',
    icon: AlertCircle,
    enLabel: 'Moderate (51-100)',
    hiLabel: 'संतोषजनक (51-100)',
  },
  sensitive: {
    border: 'border-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-950',
    badge: 'bg-orange-600 text-white',
    icon: AlertCircle,
    enLabel: 'Unhealthy for Sensitive (101-150)',
    hiLabel: 'संवेदनशील लोगों के लिए खराब (101-150)',
  },
  unhealthy: {
    border: 'border-red-600',
    bg: 'bg-red-50',
    text: 'text-red-950',
    badge: 'bg-red-700 text-white',
    icon: ShieldAlert,
    enLabel: 'Unhealthy (151-200)',
    hiLabel: 'खराब / अस्वस्थ (151-200)',
  },
  veryUnhealthy: {
    border: 'border-purple-600',
    bg: 'bg-purple-50',
    text: 'text-purple-950',
    badge: 'bg-purple-700 text-white',
    icon: ShieldAlert,
    enLabel: 'Very Unhealthy (201-300)',
    hiLabel: 'बहुत खराब (201-300)',
  },
  hazardous: {
    border: 'border-rose-900',
    bg: 'bg-rose-50',
    text: 'text-rose-950',
    badge: 'bg-rose-900 text-white',
    icon: CloudFog,
    enLabel: 'Severe / Hazardous (301-500+)',
    hiLabel: 'गंभीर / खतरनाक (301-500+)',
  },
};

export const AQICard: React.FC<AQICardProps> = ({ data, onRefresh, isLoading }) => {
  const { t, isHindi } = useI18n();
  const categoryStyle = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.moderate;
  const CategoryIcon = categoryStyle.icon;

  const categoryDesc = t.aqi[`${data.category}Desc` as keyof typeof t.aqi] || '';

  return (
    <section 
      aria-labelledby="aqi-card-heading"
      className={`rounded-2xl border-2 ${categoryStyle.border} ${categoryStyle.bg} p-5 shadow-sm transition-all`}
    >
      {/* Top Location & Timestamp */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="font-semibold text-slate-800 truncate">{data.location.name}</span>
        </div>
        <span className="text-[11px] text-slate-500">
          {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main AQI Number + Badge */}
      <div className="flex items-center justify-between mt-1 mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span id="aqi-card-heading" className="text-5xl font-black tracking-tight text-slate-900">
              {data.aqi}
            </span>
            <span className="text-xs font-bold text-slate-600 uppercase">AQI (US-EPA)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full text-xs font-bold shadow-xs">
            <span className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 ${categoryStyle.badge}`}>
              <CategoryIcon className="w-4 h-4" aria-hidden="true" />
              <span>{isHindi ? categoryStyle.hiLabel : categoryStyle.enLabel}</span>
            </span>
          </div>
        </div>

        {/* Dominant Pollutant Badge */}
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold">
            {t.aqi.dominant}
          </span>
          <span className="inline-block mt-0.5 text-lg font-bold text-slate-800 bg-white/80 px-2.5 py-0.5 rounded-md border border-slate-200">
            {data.dominantPollutant.toUpperCase()}
          </span>
          <span className="text-[11px] text-slate-600 block mt-1">
            {data.pollutants[data.dominantPollutant]} µg/m³
          </span>
        </div>
      </div>

      {/* Health Impact Plain Language */}
      <p className="text-sm text-slate-800 leading-snug mb-3">
        {categoryDesc}
      </p>

      {/* Weather & Inversion Banner */}
      {data.weather.isInversionLikely && (
        <div 
          role="alert"
          className="bg-purple-100/80 border border-purple-300 rounded-xl p-2.5 mb-3 flex items-start gap-2 text-xs text-purple-950 font-medium"
        >
          <CloudFog className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{t.aqi.inversionAlert}</span>
        </div>
      )}

      {/* Clean Air Window Recommendation */}
      <div className="bg-white/80 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-bold text-slate-800 block">{t.aqi.cleanWindow}</span>
            <span className="text-slate-600 text-[11px]">
              {data.bestCleanAirWindowToday.start} – {data.bestCleanAirWindowToday.end}
            </span>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-500 hidden sm:block max-w-[200px]">
          {data.bestCleanAirWindowToday.reason}
        </div>
      </div>

      {/* Weather details strip */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-center text-xs text-slate-700">
        <div className="flex items-center justify-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-slate-400" />
          <span>{data.weather.temperature}°C</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-slate-400" />
          <span>{data.weather.humidity}% RH</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Wind className="w-3.5 h-3.5 text-slate-400" />
          <span>{data.weather.windSpeed} km/h</span>
        </div>
      </div>
    </section>
  );
};
