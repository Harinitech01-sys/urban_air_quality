'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useI18n();

  if (compact) {
    return (
      <div 
        role="note" 
        aria-label="Medical disclaimer"
        className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded-lg border border-slate-200"
      >
        <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
        <span>{t.safety.disclaimer}</span>
      </div>
    );
  }

  return (
    <aside 
      aria-label="Health and safety notices"
      className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs text-amber-900 space-y-1 my-3"
    >
      <div className="flex items-center gap-1.5 font-semibold text-amber-950">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
        <span>Important Health & Safety Notice</span>
      </div>
      <p>{t.safety.disclaimer}</p>
      <p className="text-[11px] text-amber-800">{t.safety.n95Warning}</p>
      <p className="text-[11px] text-red-700 font-medium">{t.safety.infantWarning}</p>
    </aside>
  );
};
