'use client';

import React from 'react';
import { useI18n, Language } from '@/lib/i18n/context';
import { Wind, Globe, Shield, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
  mockScenario?: string;
  onScenarioChange?: (scenario: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  mockScenario = 'delhi_severe',
  onScenarioChange,
}) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Wind className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {t.brand.name}
            </h1>
            <p className="text-[11px] text-teal-700 font-medium hidden sm:block">
              {t.brand.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Scenario Selector */}
          {onScenarioChange && (
            <div className="relative">
              <select
                aria-label="Simulation Scenario"
                value={mockScenario}
                onChange={(e) => onScenarioChange(e.target.value)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg border border-slate-300 font-medium cursor-pointer max-w-[140px] truncate"
              >
                <option value="delhi_severe">Delhi Smog (420)</option>
                <option value="lahore_hazardous">Lahore (465)</option>
                <option value="beijing_sensitive">Beijing (145)</option>
                <option value="mumbai_moderate">Mumbai (85)</option>
                <option value="clean_baseline">Clean Air (25)</option>
              </select>
            </div>
          )}

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="हिंदी में बदलें"
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
