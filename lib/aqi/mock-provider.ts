import { AQIData, AQIProvider, HourlyForecastPoint, PollutantValues, WeatherConditions, AQICategory } from './types';
import { calculatePM25AQI, getAQICategory, getDominantPollutant, findBestCleanAirWindow } from './calculator';

export interface MockScenario {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  inversion: boolean;
  forecastTrend: 'improving' | 'worsening' | 'stagnant';
}

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
  delhi_severe: {
    id: 'delhi_severe',
    name: 'Delhi NCR Severe Winter Smog (AQI ~420)',
    city: 'New Delhi (Connaught Place)',
    lat: 28.6139,
    lon: 77.2090,
    pm25: 385.0,
    pm10: 520.0,
    no2: 88.0,
    o3: 22.0,
    temp: 14.2,
    humidity: 84,
    windSpeed: 2.8,
    inversion: true,
    forecastTrend: 'stagnant',
  },
  lahore_hazardous: {
    id: 'lahore_hazardous',
    name: 'Lahore Extreme Smog Event (AQI ~465)',
    city: 'Lahore (Gulberg)',
    lat: 31.5204,
    lon: 74.3587,
    pm25: 442.0,
    pm10: 580.0,
    no2: 95.0,
    o3: 18.0,
    temp: 13.5,
    humidity: 88,
    windSpeed: 2.1,
    inversion: true,
    forecastTrend: 'stagnant',
  },
  beijing_sensitive: {
    id: 'beijing_sensitive',
    name: 'Beijing Winter Haze (AQI ~145)',
    city: 'Beijing (Chaoyang)',
    lat: 39.9042,
    lon: 116.4074,
    pm25: 52.4,
    pm10: 98.0,
    no2: 44.0,
    o3: 31.0,
    temp: 2.1,
    humidity: 48,
    windSpeed: 6.5,
    inversion: false,
    forecastTrend: 'improving',
  },
  mumbai_moderate: {
    id: 'mumbai_moderate',
    name: 'Mumbai Coastal Moderate (AQI ~85)',
    city: 'Mumbai (Bandra)',
    lat: 19.0760,
    lon: 72.8777,
    pm25: 28.5,
    pm10: 64.0,
    no2: 32.0,
    o3: 42.0,
    temp: 28.0,
    humidity: 68,
    windSpeed: 14.2,
    inversion: false,
    forecastTrend: 'improving',
  },
  clean_baseline: {
    id: 'clean_baseline',
    name: 'Clean Air Mountain / Coast (AQI ~25)',
    city: 'Shimla / Clean Coastal',
    lat: 31.1048,
    lon: 77.1734,
    pm25: 5.8,
    pm10: 12.0,
    no2: 8.0,
    o3: 35.0,
    temp: 12.0,
    humidity: 45,
    windSpeed: 9.0,
    inversion: false,
    forecastTrend: 'improving',
  },
};

export class MockAQIProvider implements AQIProvider {
  name = 'Mock Winter Smog Engine';
  scenarioKey: string;

  constructor(scenarioKey = 'delhi_severe') {
    this.scenarioKey = scenarioKey in MOCK_SCENARIOS ? scenarioKey : 'delhi_severe';
  }

  setScenario(key: string) {
    if (key in MOCK_SCENARIOS) {
      this.scenarioKey = key;
    }
  }

  async getAQI(lat?: number, lon?: number, locationName?: string): Promise<AQIData> {
    const sc = MOCK_SCENARIOS[this.scenarioKey];
    const pollutants: PollutantValues = {
      pm25: sc.pm25,
      pm10: sc.pm10,
      no2: sc.no2,
      o3: sc.o3,
      so2: 14.0,
      co: 1.2,
    };

    const calculatedAQI = calculatePM25AQI(sc.pm25);
    const category = getAQICategory(calculatedAQI);
    const dominant = getDominantPollutant(pollutants);

    const weather: WeatherConditions = {
      temperature: sc.temp,
      humidity: sc.humidity,
      windSpeed: sc.windSpeed,
      windDirection: 315,
      boundaryLayerHeight: sc.inversion ? 280 : 950,
      isInversionLikely: sc.inversion,
    };

    // Synthesize 72-hour realistic curve
    const forecast72h: HourlyForecastPoint[] = [];
    const now = new Date();

    for (let h = 0; h < 72; h++) {
      const pointTime = new Date(now.getTime() + h * 3600 * 1000);
      const hourOfDay = pointTime.getHours();

      // Diurnal cycle: Smog peaks during 6 AM - 9 AM and 8 PM - 11 PM due to surface inversion & traffic
      let diurnalMultiplier = 1.0;
      if (hourOfDay >= 6 && hourOfDay <= 9) {
        diurnalMultiplier = 1.25; // Morning smog spike
      } else if (hourOfDay >= 12 && hourOfDay <= 16) {
        diurnalMultiplier = 0.72; // Solar boundary layer expansion & wind
      } else if (hourOfDay >= 20 && hourOfDay <= 23) {
        diurnalMultiplier = 1.20; // Night cooling & trapping
      }

      // Trend progression
      let trendMultiplier = 1.0;
      if (sc.forecastTrend === 'improving') {
        trendMultiplier = Math.max(0.5, 1.0 - (h / 72) * 0.45);
      } else if (sc.forecastTrend === 'worsening') {
        trendMultiplier = Math.min(1.4, 1.0 + (h / 72) * 0.35);
      }

      const pointPm25 = Math.max(4, Math.round(sc.pm25 * diurnalMultiplier * trendMultiplier * 10) / 10);
      const pointPm10 = Math.max(10, Math.round(sc.pm10 * diurnalMultiplier * trendMultiplier * 10) / 10);
      const pointAQI = calculatePM25AQI(pointPm25);
      const pointCategory = getAQICategory(pointAQI);
      const isFavorable = hourOfDay >= 12 && hourOfDay <= 15 && pointAQI < calculatedAQI;

      forecast72h.push({
        time: pointTime.toISOString(),
        pm25: pointPm25,
        pm10: pointPm10,
        aqi: pointAQI,
        category: pointCategory,
        temperature: Math.round((sc.temp + (hourOfDay >= 12 && hourOfDay <= 15 ? 4 : -2)) * 10) / 10,
        humidity: Math.round(Math.min(95, Math.max(35, sc.humidity - (hourOfDay >= 12 && hourOfDay <= 15 ? 15 : 0)))),
        windSpeed: Math.round((sc.windSpeed + (hourOfDay >= 12 && hourOfDay <= 15 ? 2.5 : 0)) * 10) / 10,
        boundaryLayerHeight: hourOfDay >= 12 && hourOfDay <= 16 ? 900 : 280,
        isVentilationFavorable: isFavorable,
      });
    }

    const cleanWindow = findBestCleanAirWindow(forecast72h);

    return {
      source: `CleanBreath Simulated Engine (${sc.name})`,
      timestamp: new Date().toISOString(),
      location: {
        name: locationName || sc.city,
        latitude: lat || sc.lat,
        longitude: lon || sc.lon,
      },
      aqi: calculatedAQI,
      category,
      categoryLabel: {
        en: category.charAt(0).toUpperCase() + category.slice(1),
        hi: category,
      },
      dominantPollutant: dominant,
      pollutants,
      weather,
      forecast72h,
      bestCleanAirWindowToday: cleanWindow,
    };
  }
}
