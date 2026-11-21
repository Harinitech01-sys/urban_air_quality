export type BudgetBand = 'free' | 'low' | 'moderate' | 'flexible';

export type CommuteMode = 'metro' | 'bus' | 'car' | 'twowheeler' | 'walk_cycle';

export type CookingFuel = 'lpg' | 'induction' | 'biomass';

export type PurifierType = 'none' | 'hepa' | 'diy_boxfan';

export type DwellingType = 'apartment' | 'independent';

export interface HouseholdProfile {
  id: string;
  hasCompletedOnboarding: boolean;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
  household: {
    hasInfants: boolean; // <2 years (strict safety constraint: NO MASKS)
    childrenAgeBands: ('0-2' | '3-6' | '7-12' | '13-17')[];
    hasElderly: boolean; // 65+
    hasRespiratoryCondition: boolean; // Asthma, COPD
    hasCardiacCondition: boolean;
  };
  home: {
    dwellingType: DwellingType;
    windowSealingQuality: 'poor' | 'fair' | 'tight';
    purifierType: PurifierType;
    hasKitchenExhaust: boolean;
    cookingFuel: CookingFuel;
    heatingSource: 'none' | 'electric_radiator' | 'unvented_combustion' | 'ac_heat';
  };
  commute: {
    primaryMode: CommuteMode;
    commuteDurationMinutes: number;
    canCarpoolOrMetro: boolean;
  };
  budget: BudgetBand;
  language: 'en' | 'hi';
  lowCostSensorReading?: {
    pm25: number;
    recordedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PROFILE: HouseholdProfile = {
  id: 'default-profile',
  hasCompletedOnboarding: false,
  location: {
    city: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
  },
  household: {
    hasInfants: false,
    childrenAgeBands: ['7-12'],
    hasElderly: true,
    hasRespiratoryCondition: true,
    hasCardiacCondition: false,
  },
  home: {
    dwellingType: 'apartment',
    windowSealingQuality: 'fair',
    purifierType: 'none',
    hasKitchenExhaust: true,
    cookingFuel: 'lpg',
    heatingSource: 'none',
  },
  commute: {
    primaryMode: 'twowheeler',
    commuteDurationMinutes: 40,
    canCarpoolOrMetro: true,
  },
  budget: 'low',
  language: 'en',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
