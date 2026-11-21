import { AQIData, AQIProvider } from './types';
import { OpenMeteoAQIProvider } from './open-meteo';
import { MockAQIProvider, MOCK_SCENARIOS } from './mock-provider';

interface CacheEntry {
  data: AQIData;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const openMeteo = new OpenMeteoAQIProvider();
const mockEngine = new MockAQIProvider();

export async function getAQIData(params: {
  lat?: number;
  lon?: number;
  locationName?: string;
  forceMock?: boolean;
  mockScenario?: string;
}): Promise<AQIData> {
  const {
    lat = 28.6139,
    lon = 77.2090,
    locationName = 'New Delhi',
    forceMock = false,
    mockScenario = 'delhi_severe',
  } = params;

  // Round coordinates to ~5km grid for cache aggregation
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}_${forceMock}_${mockScenario}`;
  const now = Date.now();

  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  let result: AQIData;

  if (forceMock || process.env.DEMO_MODE === 'true') {
    mockEngine.setScenario(mockScenario);
    result = await mockEngine.getAQI(lat, lon, locationName);
  } else {
    try {
      result = await openMeteo.getAQI(lat, lon, locationName);
    } catch (err) {
      console.warn('Open-Meteo API unreachable or failed; falling back to Mock Engine:', err);
      mockEngine.setScenario(mockScenario);
      result = await mockEngine.getAQI(lat, lon, locationName);
      result.source = `Fallback Engine (${result.source})`;
    }
  }

  memoryCache.set(cacheKey, {
    data: result,
    expiresAt: now + CACHE_TTL_MS,
  });

  return result;
}

export { MOCK_SCENARIOS };
