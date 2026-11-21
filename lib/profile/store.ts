import { HouseholdProfile, DEFAULT_PROFILE } from './types';

const STORAGE_KEY = 'cleanbreath_profile_v1';

export function getStoredProfile(): HouseholdProfile {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw) as HouseholdProfile;
  } catch (e) {
    console.error('Failed to load profile from storage:', e);
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: HouseholdProfile): void {
  if (typeof window === 'undefined') return;

  try {
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save profile to storage:', e);
  }
}

export function deleteStoredProfile(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('cleanbreath_lang');
    localStorage.removeItem('cleanbreath_plan_cache');
    localStorage.removeItem('cleanbreath_community_pledges');
  } catch (e) {
    console.error('Failed to delete profile:', e);
  }
}

export function exportProfileJSON(): string {
  const profile = getStoredProfile();
  return JSON.stringify(profile, null, 2);
}
