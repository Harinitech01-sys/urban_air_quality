'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AQIData } from '@/lib/aqi/types';
import { 
  Bell, 
  BellOff, 
  Moon, 
  CloudFog, 
  Wind, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Volume2
} from 'lucide-react';

interface AlertsCenterProps {
  aqiData: AQIData;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ aqiData }) => {
  const { isHindi } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(true);
  const [quietStart, setQuietStart] = useState<string>('22:00');
  const [quietEnd, setQuietEnd] = useState<string>('07:00');

  useEffect(() => {
    try {
      const savedNotify = localStorage.getItem('cleanbreath_alerts_enabled') === 'true';
      setNotificationsEnabled(savedNotify);
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('cleanbreath_alerts_enabled', 'true');
          new Notification('CleanBreath Alerts Active', {
            body: `You will receive smog spike and clean air window alerts.`,
            icon: '/favicon.ico',
          });
        }
      } else {
        setNotificationsEnabled(true);
        localStorage.setItem('cleanbreath_alerts_enabled', 'true');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('cleanbreath_alerts_enabled', 'false');
    }
  };

  const isSevere = aqiData.aqi > 250;
  const bestWindow = aqiData.bestCleanAirWindowToday;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isHindi ? 'स्मार्ट स्मॉग अलर्ट और सूचनाएं' : 'Smart Smog Alerts & Notifications'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isHindi ? 'इनवर्जन और वायु गुणवत्ता स्पाइक की त्वरित चेतावनियां' : 'Proactive alerts for spikes, inversions & clean windows'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleNotifications}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            notificationsEnabled
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          aria-label="Toggle notifications"
        >
          {notificationsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          <span>{notificationsEnabled ? (isHindi ? 'सक्रिय ✓' : 'Active ✓') : (isHindi ? 'चालू करें' : 'Enable')}</span>
        </button>
      </div>

      {/* Active Live Alerts List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          {isHindi ? 'वर्तमान सक्रिय चेतावनियां:' : 'Live Forecast Alerts:'}
        </span>

        {/* Inversion Alert */}
        {aqiData.weather.isInversionLikely && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-purple-950 font-medium">
            <CloudFog className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-purple-900">
                {isHindi ? 'शीतकालीन थर्मल इनवर्जन सक्रिय (Winter Inversion Alert)' : 'Winter Atmospheric Inversion Active'}
              </span>
              <p className="text-purple-800 text-[11px] mt-0.5 leading-snug">
                {isHindi
                  ? 'रात और सुबह की ठंड से जहरीला धुआं जमीन से 300 मीटर के अंदर फंसा है। सुबह खिड़कियां बिल्कुल न खोलें।'
                  : 'Surface cooling has compressed the boundary layer under 300m, trapping ground emissions. Keep all windows latched until noon.'}
              </p>
            </div>
          </div>
        )}

        {/* Clean Air Window Reminder */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
          <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-emerald-900">
              {isHindi ? 'आज का स्वच्छ वायु समय (Clean Air Window)' : 'Best Daily Clean Air Window'}
            </span>
            <p className="text-emerald-800 text-[11px] mt-0.5 leading-snug">
              {bestWindow.start} – {bestWindow.end} ({bestWindow.reason})
            </p>
          </div>
        </div>

        {/* Severe Smog Alert */}
        {isSevere && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-950 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-900">
                {isHindi ? `गंभीर प्रदूषण चेतावनी (AQI ${aqiData.aqi})` : `Severe Smog Surge (AQI ${aqiData.aqi})`}
              </span>
              <p className="text-red-800 text-[11px] mt-0.5 leading-snug">
                {isHindi
                  ? 'PM2.5 सुरक्षित सीमा से कई गुना अधिक है। बिना N95 मास्क के बाहर न निकलें और इनडोर व्यायाम करें।'
                  : 'Fine particulates exceed WHO 24h guidelines by 15x. Avoid any outdoor physical exertion; wear an N95 for necessary transit.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quiet Hours Settings */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">
              {isHindi ? 'शांत समय (Quiet Hours)' : 'Quiet Hours (Do Not Disturb)'}
            </span>
          </div>

          <input
            type="checkbox"
            checked={quietHoursEnabled}
            onChange={(e) => setQuietHoursEnabled(e.target.checked)}
            className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
            aria-label="Toggle quiet hours"
          />
        </div>

        <p className="text-[11px] text-slate-600">
          {isHindi 
            ? 'नींद के दौरान रात में केवल अत्यंत गंभीर आपातकालीन अलर्ट ही बजेंगे।' 
            : 'Mutes non-critical alerts overnight so family sleep is undisturbed.'}
        </p>

        {quietHoursEnabled && (
          <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-slate-700">
            <div>
              <label className="block text-[10px] text-slate-500">{isHindi ? 'प्रारंभ' : 'From'}</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500">{isHindi ? 'समाप्ति' : 'To'}</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
