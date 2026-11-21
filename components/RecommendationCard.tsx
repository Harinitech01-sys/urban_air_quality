'use client';

import React, { useState } from 'react';
import { PlanRecommendation } from '@/lib/plan/types';
import { useI18n } from '@/lib/i18n/context';
import { 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RecommendationCardProps {
  rec: PlanRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec }) => {
  const { isHindi } = useI18n();
  const [showCalculation, setShowCalculation] = useState<boolean>(false);

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case 'free':
        return { text: isHindi ? 'निःशुल्क (0 खर्च)' : 'Free (Zero-Cost)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'low':
        return { text: isHindi ? 'कम खर्च (< ₹2,500)' : 'Low Cost (<$30)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      default:
        return { text: isHindi ? 'मध्यम खर्च' : 'Moderate Cost', color: 'bg-purple-100 text-purple-800 border-purple-300' };
    }
  };

  const costBadge = getCostBadge(rec.cost);

  return (
    <article 
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Top Meta Strip */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
          {isHindi ? rec.timeLabel.hi : rec.timeLabel.en}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${costBadge.color}`}>
            {costBadge.text}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title="Scientific Evidence Confidence">
            {rec.confidence} {isHindi ? 'सटीकता' : 'Conf.'}
          </span>
        </div>
      </div>

      {/* Main Action */}
      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1.5 flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>{isHindi ? rec.action.hi : rec.action.en}</span>
      </h3>

      {/* Why It Works */}
      <p className="text-xs text-slate-600 leading-relaxed mb-3 pl-6">
        <strong className="text-slate-800">{isHindi ? 'क्यों उपयोगी है: ' : 'Why it works: '}</strong>
        {isHindi ? rec.why.hi : rec.why.en}
      </p>

      {/* Estimated Quantified Impact Box */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 ml-6 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            <span>{isHindi ? 'प्रमाणित प्रभाव:' : 'Estimated Direct Impact:'}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCalculation(!showCalculation)}
            className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-0.5 underline"
            aria-expanded={showCalculation}
          >
            <span>{isHindi ? 'गणना देखें' : 'How we calculated this'}</span>
            {showCalculation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <p className="text-xs font-semibold text-sky-950">
          {isHindi ? rec.estimatedImpact.hi : rec.estimatedImpact.en}
        </p>

        {/* Expandable Transparent Calculation Assumptions */}
        {showCalculation && (
          <div 
            className="mt-2 pt-2 border-t border-sky-200 text-[11px] text-sky-900 bg-white/70 p-2 rounded-lg"
            role="region"
            aria-label="Impact calculation assumptions and methodology"
          >
            <div className="flex items-center gap-1 font-bold text-slate-800 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>{isHindi ? 'वैज्ञानिक आधार और सूत्र:' : 'Scientific Basis & Assumptions:'}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {isHindi ? rec.assumptions.hi : rec.assumptions.en}
            </p>
            <div className="mt-1 text-[10px] text-slate-500 italic">
              {isHindi 
                ? 'स्रोत: US-EPA, WHO IAQ Guidelines, SAFAR/CPCB एयर एयरोसोल अध्ययन।' 
                : 'Sources: US-EPA RMV metrics, WHO IAQ Guidelines, SAFAR/CPCB diurnal aerosol models.'}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
