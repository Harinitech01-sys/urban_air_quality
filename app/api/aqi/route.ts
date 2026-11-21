import { NextRequest, NextResponse } from 'next/server';
import { getAQIData } from '@/lib/aqi/provider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 28.6139;
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : 77.2090;
    const locationName = searchParams.get('name') || 'New Delhi';
    const forceMock = searchParams.get('mock') === 'true';
    const mockScenario = searchParams.get('scenario') || 'delhi_severe';

    const aqiData = await getAQIData({
      lat,
      lon,
      locationName,
      forceMock,
      mockScenario,
    });

    return NextResponse.json(aqiData, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error fetching AQI:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve air quality data' },
      { status: 500 }
    );
  }
}
