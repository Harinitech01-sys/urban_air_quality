import { NextRequest, NextResponse } from 'next/server';
import { answerAssistantQuery } from '@/lib/ai/gemini';
import { getAQIData } from '@/lib/aqi/provider';
import { HouseholdProfile, DEFAULT_PROFILE } from '@/lib/profile/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, profile = DEFAULT_PROFILE, language = 'en', mockScenario = 'delhi_severe' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing required query string' }, { status: 400 });
    }

    const aqiData = await getAQIData({
      lat: profile.location?.latitude || 28.6139,
      lon: profile.location?.longitude || 77.2090,
      locationName: profile.location?.city || 'New Delhi',
      forceMock: true,
      mockScenario,
    });

    const answer = await answerAssistantQuery({
      query,
      profile,
      aqiData,
      language,
    });

    return NextResponse.json(answer);
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
