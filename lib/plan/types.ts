export type PlanTimeBlockId = 
  | 'morning' 
  | 'commute' 
  | 'school_work' 
  | 'evening' 
  | 'dinner' 
  | 'night';

export type ActionCost = 'free' | 'low' | 'medium';
export type ActionConfidence = 'High' | 'Moderate' | 'Developing';

export interface PlanRecommendation {
  id: string;
  timeBlock: PlanTimeBlockId;
  timeLabel: {
    en: string;
    hi: string;
  };
  category: 'ventilation' | 'mask' | 'commute' | 'cooking' | 'activity' | 'filtration';
  action: {
    en: string;
    hi: string;
  };
  why: {
    en: string;
    hi: string;
  };
  estimatedImpact: {
    en: string;
    hi: string;
    inhalationReductionPercent?: number; // e.g. 45 -> 45%
    avoidedCo2Kg?: number;
    avoidedPmGrams?: number;
  };
  cost: ActionCost;
  confidence: ActionConfidence;
  assumptions: {
    en: string;
    hi: string;
  };
}

export interface DailyPlan {
  id: string;
  generatedAt: string;
  isAIGenerated: boolean;
  aqiSnapshot: number;
  recommendations: PlanRecommendation[];
  summaryNote: {
    en: string;
    hi: string;
  };
}
