import { AQIData, AQIProvider, HourlyForecastPoint, PollutantValues, WeatherConditions } from './types';
import { calculatePM25AQI, getAQICategory, getDominantPollutant, findBestCleanAirWindow } from './calculator';

export class OpenMeteoAQIProvider implements AQIProvider {
  name = 'Open-Meteo';

  async getAQI(lat: number, lon: number, locationName = 'Current Location'): Promise<AQIData> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide,us_aqi&hourly=pm10,pm2_5,us_aqi&forecast_days=3`;
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=3`;

      const [aqiRes, weatherRes] = await Promise.all([
        fetch(aqiUrl, { signal: controller.signal, next: { revalidate: 1800 } }),
        fetch(weatherUrl, { signal: controller.signal, next: { revalidate: 1800 } }),
      ]);

      clearTimeout(timeout);

      if (!aqiRes.ok || !weatherRes.ok) {
        throw new Error(`Open-Meteo API returned error: AQI=${aqiRes.status}, Weather=${weatherRes.status}`);
      }

      const aqiJson = await aqiRes.json();
      const weatherJson = await weatherRes.json();

      const pm25 = aqiJson.current?.pm2_5 ?? 85.0;
      const pm10 = aqiJson.current?.pm10 ?? 140.0;
      const no2 = aqiJson.current?.nitrogen_dioxide ?? 35.0;
      const o3 = aqiJson.current?.ozone ?? 28.0;
      const co = aqiJson.current?.carbon_monoxide ?? 0.8;
      const so2 = aqiJson.current?.sulphur_dioxide ?? 12.0;

      const pollutants: PollutantValues = { pm25, pm10, no2, o3, so2, co };
      const calculatedAQI = aqiJson.current?.us_aqi ? Math.round(aqiJson.current.us_aqi) : calculatePM25AQI(pm25);
      const category = getAQICategory(calculatedAQI);
      const dominant = getDominantPollutant(pollutants);

      const temperature = weatherJson.current?.temperature_2m ?? 18;
      const humidity = weatherJson.current?.relative_humidity_2m ?? 65;
      const windSpeed = weatherJson.current?.wind_speed_10m ?? 4.5;
      const windDirection = weatherJson.current?.wind_direction_10m ?? 180;
      
      // Atmospheric inversion is indicated by low wind speed (< 7 km/h), high humidity (> 60%), low temperature
      const isInversionLikely = windSpeed < 7.0 && humidity > 60 && temperature < 20;

      const weather: WeatherConditions = {
        temperature,
        humidity,
        windSpeed,
        windDirection,
        isInversionLikely,
      };

      // Process 72-hour forecast
      const hourlyTimes: string[] = aqiJson.hourly?.time ?? [];
      const hourlyPm25: number[] = aqiJson.hourly?.pm2_5 ?? [];
      const hourlyPm10: number[] = aqiJson.hourly?.pm10 ?? [];
      const hourlyAqi: number[] = aqiJson.hourly?.us_aqi ?? [];
      const hourlyTemp: number[] = weatherJson.hourly?.temperature_2m ?? [];
      const hourlyHumid: number[] = weatherJson.hourly?.relative_humidity_2m ?? [];
      const hourlyWind: number[] = weatherJson.hourly?.wind_speed_10m ?? [];

      const forecast72h: HourlyForecastPoint[] = hourlyTimes.slice(0, 72).map((time, idx) => {
        const p25 = hourlyPm25[idx] ?? pm25;
        const p10 = hourlyPm10[idx] ?? pm10;
        const ptAqi = hourlyAqi[idx] ? Math.round(hourlyAqi[idx]) : calculatePM25AQI(p25);
        const temp = hourlyTemp[idx] ?? temperature;
        const hum = hourlyHumid[idx] ?? humidity;
        const wind = hourlyWind[idx] ?? windSpeed;
        const isFavorable = wind > 8 || (temp > 22 && hum < 50);

        return {
          time,
          pm25: Math.round(p25 * 10) / 10,
          pm10: Math.round(p10 * 10) / 10,
          aqi: ptAqi,
          category: getAQICategory(ptAqi),
          temperature: Math.round(temp * 10) / 10,
          humidity: Math.round(hum),
          windSpeed: Math.round(wind * 10) / 10,
          isVentilationFavorable: isFavorable,
        };
      });

      const bestCleanAirWindow = findBestCleanAirWindow(forecast72h);

      return {
        source: 'Open-Meteo Air Quality & Weather API',
        timestamp: new Date().toISOString(),
        location: {
          name: locationName,
          latitude: lat,
          longitude: lon,
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
        bestCleanAirWindowToday: bestCleanAirWindow,
      };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }
}
