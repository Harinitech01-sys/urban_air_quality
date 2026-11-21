export type AQICategory = 
  | 'good' 
  | 'moderate' 
  | 'sensitive' 
  | 'unhealthy' 
  | 'veryUnhealthy' 
  | 'hazardous';

export interface PollutantValues {
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  no2: number;  // ug/m3
  o3: number;   // ug/m3
  so2?: number; // ug/m3
  co?: number;  // ug/m3
}

export interface WeatherConditions {
  temperature: number; // Celsius
  humidity: number;    // %
  windSpeed: number;   // km/h
  windDirection?: number; // degrees
  boundaryLayerHeight?: number; // meters (indicator of atmospheric inversion)
  isInversionLikely: boolean;
}

export interface HourlyForecastPoint {
  time: string; // ISO string
  pm25: number;
  pm10: number;
  aqi: number;
  category: AQICategory;
  temperature: number;
  humidity: number;
  windSpeed: number;
  boundaryLayerHeight?: number;
  isVentilationFavorable: boolean;
}

export interface AQIData {
  source: string;
  timestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  aqi: number; // 0-500 standard scale
  category: AQICategory;
  categoryLabel: {
    en: string;
    hi: string;
  };
  dominantPollutant: 'pm25' | 'pm10' | 'no2' | 'o3';
  pollutants: PollutantValues;
  weather: WeatherConditions;
  forecast72h: HourlyForecastPoint[];
  bestCleanAirWindowToday: {
    start: string;
    end: string;
    reason: string;
  };
}

export interface AQIProvider {
  name: string;
  getAQI(lat: number, lon: number, locationName?: string): Promise<AQIData>;
}
