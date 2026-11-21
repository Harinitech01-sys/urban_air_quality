/**
 * CleanBreath Deterministic Impact Calculator
 * 
 * Strict Architecture Rule:
 * All numerical metrics, percentages, ranges, and avoided emissions MUST be computed
 * deterministically by this module. The LLM is provided the computed outputs to explain
 * in plain language, but must NEVER invent or hallucinate numbers.
 * 
 * All formulas and factors documented in /docs/METHODOLOGY.md.
 */

export interface InhalationParams {
  pm25Concentration: number; // ug/m3
  durationHours: number;      // hours
  activityLevel: 'sleep' | 'sedentary' | 'light_walk' | 'brisk_walk' | 'heavy_exercise';
  isChild?: boolean;
  filterEfficiency?: number; // 0.0 to 1.0 (e.g. 0.95 for N95, 0.85 for indoor HEPA)
}

export interface InhalationResult {
  inhaledMicrograms: number;
  unfilteredMicrograms: number;
  reductionMicrograms: number;
  reductionPercentage: number;
  uncertaintyRange: {
    minPercent: number;
    maxPercent: number;
  };
}

export interface CommuteSwapParams {
  distanceKm: number;
  tripsPerWeek: number;
  baselineMode: 'petrol_car' | 'diesel_car' | 'twowheeler';
  alternativeMode: 'metro' | 'cng_bus' | 'walk_cycle' | 'carpool' | 'ev';
}

export interface CommuteSwapResult {
  weeklyAvoidedCo2Kg: number;
  annualAvoidedCo2Kg: number;
  weeklyAvoidedPmGrams: number;
  annualAvoidedPmGrams: number;
  weeklyAvoidedNoxGrams: number;
  rangePercentage: {
    min: number;
    max: number;
  };
}

export interface CookingSwapParams {
  baselineFuel: 'biomass_wood' | 'biomass_dung' | 'lpg';
  alternativeFuel: 'lpg' | 'induction';
  mealsPerDay?: number;
}

export interface CookingSwapResult {
  dailyAvoidedCo2Kg: number;
  dailyAvoidedPmGrams: number;
  indoorPmPeakReductionPercent: number;
  eliminatesCarbonMonoxideRisk: boolean;
}

// Ventilation Rates (m3/hour) based on US EPA Exposure Factors Handbook (2011) Table 6-1
export const VENTILATION_RATES: Record<string, { adult: number; child: number }> = {
  sleep: { adult: 0.45, child: 0.32 },
  sedentary: { adult: 0.60, child: 0.44 },
  light_walk: { adult: 0.90, child: 0.68 },
  brisk_walk: { adult: 1.50, child: 1.15 },
  heavy_exercise: { adult: 2.40, child: 1.80 },
};

// Filter efficiencies based on NIOSH, CDC, and aerosol filtration benchmarks
export const FILTER_EFFICIENCIES: Record<string, { nominal: number; min: number; max: number }> = {
  n95_fitted: { nominal: 0.95, min: 0.90, max: 0.98 },
  n95_loose: { nominal: 0.70, min: 0.55, max: 0.80 },
  surgical_mask: { nominal: 0.35, min: 0.20, max: 0.50 },
  cloth_mask: { nominal: 0.15, min: 0.08, max: 0.25 },
  indoor_hepa: { nominal: 0.85, min: 0.75, max: 0.95 },
  indoor_diy_boxfan: { nominal: 0.80, min: 0.70, max: 0.90 },
  sealed_room_zero_purifier: { nominal: 0.35, min: 0.25, max: 0.45 },
};

// Emission factors (g per vehicle-km or g per passenger-km)
// Sources: ARAI, CPCB, Central Road Research Institute (CRRI), and ICCT India Fleet Studies
export const EMISSION_FACTORS = {
  // Vehicle tailpipe + non-exhaust emissions
  petrol_car: { co2: 155.0, pm25: 0.035, nox: 0.22 }, // g/km
  diesel_car: { co2: 175.0, pm25: 0.085, nox: 0.58 }, // g/km
  twowheeler: { co2: 52.0, pm25: 0.038, nox: 0.18 }, // g/km
  ev: { co2: 45.0, pm25: 0.006, nox: 0.02 }, // grid equivalent
  // Mass transit per passenger-km
  metro: { co2: 18.0, pm25: 0.002, nox: 0.015 }, // g/p-km
  cng_bus: { co2: 32.0, pm25: 0.005, nox: 0.12 }, // g/p-km
  carpool_2person: { co2: 77.5, pm25: 0.018, nox: 0.11 }, // half petrol car
  walk_cycle: { co2: 0.0, pm25: 0.0, nox: 0.0 },
};

/**
 * Calculates deterministic inhaled PM2.5 mass in micrograms.
 */
export function calculateInhaledPM25(params: InhalationParams): InhalationResult {
  const { pm25Concentration, durationHours, activityLevel, isChild = false, filterEfficiency = 0.0 } = params;

  const ventRate = isChild 
    ? VENTILATION_RATES[activityLevel].child 
    : VENTILATION_RATES[activityLevel].adult;

  // Total air inhaled in cubic meters
  const totalInhaledM3 = ventRate * durationHours;

  // Unfiltered inhaled PM2.5 in micrograms
  const unfilteredMicrograms = pm25Concentration * totalInhaledM3;

  // Inhaled with filter
  const effectiveFilter = Math.max(0, Math.min(0.99, filterEfficiency));
  const inhaledMicrograms = unfilteredMicrograms * (1.0 - effectiveFilter);
  const reductionMicrograms = unfilteredMicrograms - inhaledMicrograms;
  const reductionPercentage = Math.round(effectiveFilter * 100);

  // Range bound (+/- 8% accounting for breathing variations)
  const minPercent = Math.max(0, Math.round(reductionPercentage * 0.90));
  const maxPercent = Math.min(99, Math.round(reductionPercentage * 1.08));

  return {
    inhaledMicrograms: Math.round(inhaledMicrograms * 10) / 10,
    unfilteredMicrograms: Math.round(unfilteredMicrograms * 10) / 10,
    reductionMicrograms: Math.round(reductionMicrograms * 10) / 10,
    reductionPercentage,
    uncertaintyRange: { minPercent, maxPercent },
  };
}

/**
 * Calculates personal exposure reduction from timing ventilation or shifting outdoor workouts.
 */
export function calculateVentilationShiftImpact(params: {
  morningPeakPm25: number;
  middayWindowPm25: number;
  durationMinutes: number;
  activityLevel: 'brisk_walk' | 'heavy_exercise' | 'light_walk';
  isChild?: boolean;
}): {
  inhaledMorningPeakUg: number;
  inhaledMiddayWindowUg: number;
  avoidedInhalationUg: number;
  reductionPercent: number;
  rangeText: string;
} {
  const { morningPeakPm25, middayWindowPm25, durationMinutes, activityLevel, isChild = false } = params;
  const hours = durationMinutes / 60;

  const morning = calculateInhaledPM25({
    pm25Concentration: morningPeakPm25,
    durationHours: hours,
    activityLevel,
    isChild,
  });

  const midday = calculateInhaledPM25({
    pm25Concentration: middayWindowPm25,
    durationHours: hours,
    activityLevel,
    isChild,
  });

  const avoidedInhalationUg = Math.round((morning.inhaledMicrograms - midday.inhaledMicrograms) * 10) / 10;
  const reductionPercent = morning.inhaledMicrograms > 0
    ? Math.round((avoidedInhalationUg / morning.inhaledMicrograms) * 100)
    : 0;

  const minRange = Math.max(0, Math.round(reductionPercent * 0.88));
  const maxRange = Math.min(98, Math.round(reductionPercent * 1.10));

  return {
    inhaledMorningPeakUg: morning.inhaledMicrograms,
    inhaledMiddayWindowUg: midday.inhaledMicrograms,
    avoidedInhalationUg,
    reductionPercent,
    rangeText: `${minRange}% to ${maxRange}%`,
  };
}

/**
 * Calculates avoided emissions from commute mode switches.
 */
export function calculateCommuteSwap(params: CommuteSwapParams): CommuteSwapResult {
  const { distanceKm, tripsPerWeek, baselineMode, alternativeMode } = params;
  const totalWeeklyKm = distanceKm * tripsPerWeek;

  const baseEF = EMISSION_FACTORS[baselineMode];
  let altEF = EMISSION_FACTORS.walk_cycle;

  if (alternativeMode === 'metro') altEF = EMISSION_FACTORS.metro;
  else if (alternativeMode === 'cng_bus') altEF = EMISSION_FACTORS.cng_bus;
  else if (alternativeMode === 'carpool') altEF = EMISSION_FACTORS.carpool_2person;
  else if (alternativeMode === 'ev') altEF = EMISSION_FACTORS.ev;

  // Weekly avoided CO2 in kg
  const weeklyCo2Grams = totalWeeklyKm * (baseEF.co2 - altEF.co2);
  const weeklyAvoidedCo2Kg = Math.max(0, Math.round((weeklyCo2Grams / 1000) * 100) / 100);
  const annualAvoidedCo2Kg = Math.round(weeklyAvoidedCo2Kg * 50);

  // Weekly avoided PM2.5 in grams
  const weeklyPmGrams = totalWeeklyKm * (baseEF.pm25 - altEF.pm25);
  const weeklyAvoidedPmGrams = Math.max(0, Math.round(weeklyPmGrams * 100) / 100);
  const annualAvoidedPmGrams = Math.round(weeklyAvoidedPmGrams * 50 * 10) / 10;

  // Weekly avoided NOx in grams
  const weeklyNoxGrams = totalWeeklyKm * (baseEF.nox - altEF.nox);
  const weeklyAvoidedNoxGrams = Math.max(0, Math.round(weeklyNoxGrams * 100) / 100);

  return {
    weeklyAvoidedCo2Kg,
    annualAvoidedCo2Kg,
    weeklyAvoidedPmGrams,
    annualAvoidedPmGrams,
    weeklyAvoidedNoxGrams,
    rangePercentage: {
      min: Math.round(weeklyAvoidedCo2Kg * 0.85 * 10) / 10,
      max: Math.round(weeklyAvoidedCo2Kg * 1.15 * 10) / 10,
    },
  };
}

/**
 * Calculates avoided emissions and indoor risk reduction from clean cooking swaps.
 */
export function calculateCookingSwap(params: CookingSwapParams): CookingSwapResult {
  const { baselineFuel, alternativeFuel, mealsPerDay = 2 } = params;

  if (baselineFuel === 'biomass_wood' || baselineFuel === 'biomass_dung') {
    if (alternativeFuel === 'lpg' || alternativeFuel === 'induction') {
      return {
        dailyAvoidedCo2Kg: 2.8 * (mealsPerDay / 2),
        dailyAvoidedPmGrams: 16.4 * (mealsPerDay / 2),
        indoorPmPeakReductionPercent: 88,
        eliminatesCarbonMonoxideRisk: true,
      };
    }
  }

  // LPG to induction
  return {
    dailyAvoidedCo2Kg: 0.42 * (mealsPerDay / 2),
    dailyAvoidedPmGrams: 0.08 * (mealsPerDay / 2),
    indoorPmPeakReductionPercent: 25,
    eliminatesCarbonMonoxideRisk: true,
  };
}

/**
 * Calculates Air Changes per Hour (ACH) and room purifier sizing.
 */
export function calculateRoomPurifierSizing(params: {
  roomLengthMeters: number;
  roomWidthMeters: number;
  roomHeightMeters?: number;
  purifierCadrM3PerHour: number;
}): {
  roomVolumeM3: number;
  airChangesPerHour: number;
  isAdequate: boolean;
  recommendedMinimumCADR: number;
  expectedPM25ReductionPercent: number;
} {
  const { roomLengthMeters, roomWidthMeters, roomHeightMeters = 2.8, purifierCadrM3PerHour } = params;
  const roomVolumeM3 = roomLengthMeters * roomWidthMeters * roomHeightMeters;

  // Air Changes per Hour = CADR / Volume
  const airChangesPerHour = roomVolumeM3 > 0 
    ? Math.round((purifierCadrM3PerHour / roomVolumeM3) * 10) / 10 
    : 0;

  // ASHRAE / CDC standard: at least 4.0 ACH for effective pathogen & aerosol reduction
  const isAdequate = airChangesPerHour >= 4.0;
  const recommendedMinimumCADR = Math.round(roomVolumeM3 * 4.0);

  // Steady-state indoor/outdoor ratio approximation: C_in = C_out / (1 + CADR / (V * natural_leakage))
  // For ACH >= 4, typical PM2.5 reduction in closed bedroom is 80% to 92%
  const expectedPM25ReductionPercent = airChangesPerHour >= 4.0 
    ? 88 
    : Math.min(75, Math.round(airChangesPerHour * 18));

  return {
    roomVolumeM3: Math.round(roomVolumeM3 * 10) / 10,
    airChangesPerHour,
    isAdequate,
    recommendedMinimumCADR,
    expectedPM25ReductionPercent,
  };
}
