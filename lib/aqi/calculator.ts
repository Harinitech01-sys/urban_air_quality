import { AQICategory, PollutantValues, HourlyForecastPoint } from './types';

// EPA PM2.5 AQI Breakpoints (ug/m3 -> AQI)
export function calculatePM25AQI(pm25: number): number {
  if (pm25 < 0) return 0;
  if (pm25 <= 12.0) return Math.round(((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  if (pm25 <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
  if (pm25 <= 500.4) return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
  return Math.min(800, Math.round(500 + (pm25 - 500.4)));
}

// EPA PM10 AQI Breakpoints (ug/m3 -> AQI)
export function calculatePM10AQI(pm10: number): number {
  if (pm10 < 0) return 0;
  if (pm10 <= 54) return Math.round(((50 - 0) / (54 - 0)) * pm10);
  if (pm10 <= 154) return Math.round(((100 - 51) / (154 - 55)) * (pm10 - 55) + 51);
  if (pm10 <= 254) return Math.round(((150 - 101) / (254 - 155)) * (pm10 - 155) + 101);
  if (pm10 <= 354) return Math.round(((200 - 151) / (354 - 255)) * (pm10 - 255) + 151);
  if (pm10 <= 424) return Math.round(((300 - 201) / (424 - 355)) * (pm10 - 355) + 201);
  return Math.min(500, Math.round(((500 - 301) / (604 - 425)) * (pm10 - 425) + 301));
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'veryUnhealthy';
  return 'hazardous';
}

export function getDominantPollutant(pollutants: PollutantValues): 'pm25' | 'pm10' | 'no2' | 'o3' {
  const pm25Aqi = calculatePM25AQI(pollutants.pm25);
  const pm10Aqi = calculatePM10AQI(pollutants.pm10);
  const no2Aqi = pollutants.no2 * 0.8;
  const o3Aqi = pollutants.o3 * 0.9;

  const max = Math.max(pm25Aqi, pm10Aqi, no2Aqi, o3Aqi);
  if (max === pm25Aqi) return 'pm25';
  if (max === pm10Aqi) return 'pm10';
  if (max === no2Aqi) return 'no2';
  return 'o3';
}

export function findBestCleanAirWindow(forecast: HourlyForecastPoint[]): {
  start: string;
  end: string;
  reason: string;
} {
  if (!forecast || forecast.length === 0) {
    return {
      start: '12:00 PM',
      end: '3:00 PM',
      reason: 'Midday solar heating elevates the boundary layer, dispersing ground-level smog.',
    };
  }

  // Look at next 24 hours
  const next24h = forecast.slice(0, 24);
  let bestIdx = 0;
  let lowestAqi = Infinity;

  next24h.forEach((point, idx) => {
    if (point.aqi < lowestAqi) {
      lowestAqi = point.aqi;
      bestIdx = idx;
    }
  });

  const bestPoint = next24h[bestIdx];
  const dateObj = new Date(bestPoint.time);
  const startHour = dateObj.getHours();
  const endHour = (startHour + 3) % 24;

  const formatH = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:00 ${ampm}`;
  };

  return {
    start: formatH(startHour),
    end: formatH(endHour),
    reason: `AQI forecasted at ${bestPoint.aqi} (${getAQICategory(bestPoint.aqi)}) with higher boundary layer ventilation.`,
  };
}
