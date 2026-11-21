'use client';

import React, { useState } from 'react';
import { HourlyForecastPoint } from '@/lib/aqi/types';
import { useI18n } from '@/lib/i18n/context';
import { Calendar, ChevronRight, Wind, AlertCircle } from 'lucide-react';

interface ForecastChartProps {
  forecast: HourlyForecastPoint[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'24h' | '72h'>('24h');

  const displayedPoints = activeTab === '24h' ? forecast.slice(0, 24) : forecast.slice(0, 72);

  // Helper for color bar
  const getBarColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-teal-600';
    if (aqi <= 100) return 'bg-amber-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-600';
    if (aqi <= 300) return 'bg-purple-600';
    return 'bg-rose-900';
  };

  const maxAQI = Math.max(...displayedPoints.map((p) => p.aqi), 300);

  return (
    <section 
      aria-label="Air Quality 72-hour forecast" 
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs my-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">{t.aqi.forecast72h}</h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('24h')}
            className={`px-2 py-0.5 rounded ${
              activeTab === '24h' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            24h
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('72h')}
            className={`px-2 py-0.5 rounded ${
              activeTab === '72h' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            72h
          </button>
        </div>
      </div>

      {/* Horizontal scrolling timeline bar */}
      <div 
        tabIndex={0}
        role="region"
        aria-label="Hourly air quality forecast scrollable strip"
        className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin focus:ring-1 focus:ring-teal-500 rounded-lg"
      >
        {displayedPoints.map((point, idx) => {
          const date = new Date(point.time);
          const hour = date.getHours();
          const ampm = hour >= 12 ? 'pm' : 'am';
          const h12 = hour % 12 || 12;
          const heightPercent = Math.min(100, Math.max(15, (point.aqi / maxAQI) * 100));

          return (
            <div
              key={point.time + idx}
              className="flex-shrink-0 flex flex-col items-center justify-end w-11 text-center group cursor-pointer"
              title={`Time: ${h12} ${ampm}, AQI: ${point.aqi}, PM2.5: ${point.pm25} µg/m³`}
            >
              {/* AQI text badge */}
              <span className="text-[10px] font-bold text-slate-700 mb-1">
                {point.aqi}
              </span>

              {/* Bar container */}
              <div className="w-6 h-24 bg-slate-100 rounded-md flex flex-col justify-end p-0.5 relative">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded transition-all ${getBarColor(point.aqi)}`}
                />
                {point.isVentilationFavorable && (
                  <div 
                    title="Clean Air Window: Favorable ventilation" 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                  />
                )}
              </div>

              {/* Time Label */}
              <span className="text-[10px] font-semibold text-slate-500 mt-1.5">
                {h12}{ampm}
              </span>
              <span className="text-[9px] text-slate-400">
                {date.toLocaleDateString([], { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Clean air / ventilation window</span>
        </div>
        <div className="text-right">
          <span>Scroll horizontally for all hours &rarr;</span>
        </div>
      </div>
    </section>
  );
};
