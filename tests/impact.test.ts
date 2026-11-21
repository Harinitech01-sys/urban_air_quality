import { describe, it, expect } from 'vitest';
import {
  calculateInhaledPM25,
  calculateVentilationShiftImpact,
  calculateCommuteSwap,
  calculateCookingSwap,
  calculateRoomPurifierSizing,
  VENTILATION_RATES,
  FILTER_EFFICIENCIES,
  EMISSION_FACTORS,
} from '../lib/impact/calculator';

describe('CleanBreath Impact Calculator Module', () => {
  describe('Inhalation Exposure Calculation', () => {
    it('calculates correct unfiltered inhalation for adult brisk walk', () => {
      // 300 ug/m3 PM2.5, 1 hour, adult brisk walk (1.5 m3/h) -> 450 ug unfiltered
      const result = calculateInhaledPM25({
        pm25Concentration: 300,
        durationHours: 1.0,
        activityLevel: 'brisk_walk',
        filterEfficiency: 0.0,
      });

      expect(result.unfilteredMicrograms).toBe(450.0);
      expect(result.inhaledMicrograms).toBe(450.0);
      expect(result.reductionPercentage).toBe(0);
    });

    it('correctly applies N95 95% filtration efficiency', () => {
      const result = calculateInhaledPM25({
        pm25Concentration: 400,
        durationHours: 0.75, // 45 mins
        activityLevel: 'brisk_walk',
        filterEfficiency: FILTER_EFFICIENCIES.n95_fitted.nominal, // 0.95
      });

      // Total air = 1.5 * 0.75 = 1.125 m3
      // Unfiltered = 400 * 1.125 = 450 ug
      // Inhaled with 95% filter = 450 * 0.05 = 22.5 ug
      expect(result.unfilteredMicrograms).toBe(450.0);
      expect(result.inhaledMicrograms).toBe(22.5);
      expect(result.reductionMicrograms).toBe(427.5);
      expect(result.reductionPercentage).toBe(95);
      expect(result.uncertaintyRange.minPercent).toBeGreaterThanOrEqual(80);
      expect(result.uncertaintyRange.maxPercent).toBeLessThanOrEqual(100);
    });

    it('handles child respiratory scaling', () => {
      const adultResult = calculateInhaledPM25({
        pm25Concentration: 250,
        durationHours: 1.0,
        activityLevel: 'light_walk',
        isChild: false,
      });

      const childResult = calculateInhaledPM25({
        pm25Concentration: 250,
        durationHours: 1.0,
        activityLevel: 'light_walk',
        isChild: true,
      });

      // Child has lower total absolute volume (0.68 vs 0.90 m3/h)
      expect(childResult.unfilteredMicrograms).toBeLessThan(adultResult.unfilteredMicrograms);
      expect(childResult.unfilteredMicrograms).toBe(170.0);
      expect(adultResult.unfilteredMicrograms).toBe(225.0);
    });
  });

  describe('Ventilation Shift Calculation', () => {
    it('calculates inhalation savings when shifting workout from morning peak to clean window', () => {
      const result = calculateVentilationShiftImpact({
        morningPeakPm25: 380,
        middayWindowPm25: 110,
        durationMinutes: 45,
        activityLevel: 'heavy_exercise',
      });

      expect(result.avoidedInhalationUg).toBeGreaterThan(0);
      expect(result.reductionPercent).toBe(71);
      expect(result.rangeText).toMatch(/% to /);
    });
  });

  describe('Commute Swap Emissions Calculation', () => {
    it('calculates avoided emissions when shifting from petrol car to metro', () => {
      // 15 km round trip, 10 trips/week (5 days)
      const result = calculateCommuteSwap({
        distanceKm: 15,
        tripsPerWeek: 10,
        baselineMode: 'petrol_car',
        alternativeMode: 'metro',
      });

      // Total km = 150 km
      // Petrol car CO2: 155 g/km; Metro: 18 g/p-km
      // Delta = 150 * (155 - 18) = 150 * 137 = 20,550 g = 20.55 kg CO2
      expect(result.weeklyAvoidedCo2Kg).toBe(20.55);
      expect(result.annualAvoidedCo2Kg).toBe(1028);
      expect(result.weeklyAvoidedPmGrams).toBeGreaterThan(4);
      expect(result.weeklyAvoidedNoxGrams).toBeGreaterThan(25);
    });

    it('calculates two-wheeler to bus swap', () => {
      const result = calculateCommuteSwap({
        distanceKm: 10,
        tripsPerWeek: 6,
        baselineMode: 'twowheeler',
        alternativeMode: 'cng_bus',
      });

      expect(result.weeklyAvoidedCo2Kg).toBeGreaterThan(0);
      expect(result.weeklyAvoidedPmGrams).toBeGreaterThan(0);
    });
  });

  describe('Cooking Fuel Swap Calculation', () => {
    it('calculates biomass to LPG/induction transition', () => {
      const result = calculateCookingSwap({
        baselineFuel: 'biomass_wood',
        alternativeFuel: 'lpg',
        mealsPerDay: 2,
      });

      expect(result.eliminatesCarbonMonoxideRisk).toBe(true);
      expect(result.indoorPmPeakReductionPercent).toBe(88);
      expect(result.dailyAvoidedCo2Kg).toBe(2.8);
      expect(result.dailyAvoidedPmGrams).toBe(16.4);
    });
  });

  describe('Room Purifier CADR & ACH Sizing', () => {
    it('correctly calculates adequate ACH for standard bedroom', () => {
      // Room: 4m x 3.5m x 2.8m = 39.2 m3. CADR: 250 m3/h
      // ACH = 250 / 39.2 = 6.4 ACH
      const sizing = calculateRoomPurifierSizing({
        roomLengthMeters: 4.0,
        roomWidthMeters: 3.5,
        roomHeightMeters: 2.8,
        purifierCadrM3PerHour: 250,
      });

      expect(sizing.roomVolumeM3).toBe(39.2);
      expect(sizing.airChangesPerHour).toBe(6.4);
      expect(sizing.isAdequate).toBe(true);
      expect(sizing.expectedPM25ReductionPercent).toBe(88);
    });

    it('identifies undersized purifier in large room', () => {
      const sizing = calculateRoomPurifierSizing({
        roomLengthMeters: 7.0,
        roomWidthMeters: 5.0,
        roomHeightMeters: 3.0,
        purifierCadrM3PerHour: 80, // undersized (80 m3/h for 105 m3)
      });

      expect(sizing.roomVolumeM3).toBe(105);
      expect(sizing.airChangesPerHour).toBe(0.8);
      expect(sizing.isAdequate).toBe(false);
      expect(sizing.recommendedMinimumCADR).toBe(420);
    });
  });
});
