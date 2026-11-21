'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { calculateRoomPurifierSizing } from '@/lib/impact/calculator';
import { AQIData } from '@/lib/aqi/types';
import { HouseholdProfile } from '@/lib/profile/types';
import { 
  Home, 
  Wind, 
  Hammer, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Sliders, 
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface IAQCoachViewProps {
  aqiData: AQIData;
  profile: HouseholdProfile;
  onUpdateSensorReading?: (reading: number) => void;
}

export const IAQCoachView: React.FC<IAQCoachViewProps> = ({
  aqiData,
  profile,
  onUpdateSensorReading,
}) => {
  const { t, isHindi } = useI18n();

  // State for HEPA sizing tool
  const [roomLength, setRoomLength] = useState<number>(4.0); // meters
  const [roomWidth, setRoomWidth] = useState<number>(3.5);   // meters
  const [purifierCADR, setPurifierCADR] = useState<number>(250); // m3/h

  // State for Low-cost PM sensor
  const [sensorInput, setSensorInput] = useState<string>('120');
  const [sensorCalculated, setSensorCalculated] = useState<{
    indoorPM: number;
    outdoorPM: number;
    ratio: number;
    status: 'good' | 'moderate' | 'leaky';
  } | null>(null);

  // Calculate purifier sizing
  const sizingResult = calculateRoomPurifierSizing({
    roomLengthMeters: roomLength,
    roomWidthMeters: roomWidth,
    roomHeightMeters: 2.8,
    purifierCadrM3PerHour: purifierCADR,
  });

  const handleEvaluateSensor = () => {
    const val = parseFloat(sensorInput);
    if (isNaN(val) || val < 0) return;

    const outdoorPM = aqiData.pollutants.pm25;
    const ratio = outdoorPM > 0 ? Math.round((val / outdoorPM) * 100) : 50;

    let status: 'good' | 'moderate' | 'leaky' = 'moderate';
    if (ratio < 30) status = 'good';
    else if (ratio > 65) status = 'leaky';

    setSensorCalculated({
      indoorPM: val,
      outdoorPM,
      ratio,
      status,
    });

    if (onUpdateSensorReading) {
      onUpdateSensorReading(val);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{t.iaq.title}</h2>
            <p className="text-xs text-slate-500">{t.iaq.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 1. DIY Corsi-Rosenthal Box Fan Filter Guide */}
      <section 
        aria-labelledby="diy-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h3 id="diy-heading" className="text-sm font-bold text-slate-900">
              {t.iaq.diyTitle}
            </h3>
          </div>
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {isHindi ? 'लागत: ~₹3,500 ($45)' : 'Cost: ~$45 / ₹3,500'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t.iaq.diyDesc}
        </p>

        {/* Materials Checklist */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
          <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
            {isHindi ? 'आवश्यक सामग्री सूची:' : 'Required Materials:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>{isHindi ? '1x 20 इंच बॉक्स फैन (~₹1,800)' : '1x 20" Box Fan (~$20-$25)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>{isHindi ? '4x MERV-13 (20"x20") फिल्टर' : '4x MERV-13 20"x20" Filters'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>{isHindi ? '1x डक्ट टेप और कार्डबोर्ड बेस' : '1x Heavy Duct Tape & Cardboard base'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span>{isHindi ? '1x कार्डबोर्ड गोल कफ (Shroud)' : '1x Cardboard 15" circular Shroud'}</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>{isHindi ? 'चारों फिल्टरों को एक घन (Cube) के रूप में टेप से जोड़ें, तीरों को अंदर की तरफ रखें।' : 'Tape 4 MERV-13 filters into a cube with airflow arrows pointing inward.'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>{isHindi ? 'कार्डबोर्ड से नीचे का तल सील करें और ऊपर 20" बॉक्स फैन को बाहर हवा फेंकने की दिशा में रखें।' : 'Tape cardboard to the bottom and mount the 20" box fan on top blowing UP/OUT.'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <span>{isHindi ? 'पंखा चेहरे पर एक 15 इंच का गोल कार्डबोर्ड कफ लगाएं (यह हवा का बैकफ्लो 15% रोकता है)।' : 'Cut a 15" circular shroud from cardboard and tape to the fan face to eliminate corner air backflow.'}</span>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 text-xs text-teal-900 font-medium">
          💡 {isHindi ? 'यह DIY बॉक्स 600-800 m³/h CADR देता है, जो ₹40,000 के महंगे कमर्शियल प्यूरीफायर के बराबर है।' : 'Delivers 600-800 m³/h clean CADR, outperforming standard $300 commercial purifiers at 1/5th the cost.'}
        </div>
      </section>

      {/* 2. HEPA Room Sizing & CADR Calculator */}
      <section 
        aria-labelledby="cadr-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <div>
            <h3 id="cadr-heading" className="text-sm font-bold text-slate-900">
              {t.iaq.cadrTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.iaq.cadrDesc}</p>
          </div>
        </div>

        {/* Input sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isHindi ? 'कमरे की लंबाई' : 'Room Length'} ({roomLength} m)
            </label>
            <input
              type="range"
              min="2.5"
              max="8.0"
              step="0.5"
              value={roomLength}
              onChange={(e) => setRoomLength(parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isHindi ? 'कमरे की चौड़ाई' : 'Room Width'} ({roomWidth} m)
            </label>
            <input
              type="range"
              min="2.5"
              max="8.0"
              step="0.5"
              value={roomWidth}
              onChange={(e) => setRoomWidth(parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isHindi ? 'प्यूरीफायर CADR' : 'Purifier CADR'} ({purifierCADR} m³/h)
            </label>
            <input
              type="range"
              min="50"
              max="650"
              step="25"
              value={purifierCADR}
              onChange={(e) => setPurifierCADR(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>
        </div>

        {/* Result summary card */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          sizingResult.isAdequate 
            ? 'bg-teal-50 border-teal-500 text-teal-950' 
            : 'bg-amber-50 border-amber-500 text-amber-950'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {sizingResult.isAdequate 
                ? (isHindi ? '✓ क्षमता पर्याप्त है' : '✓ Adequately Sized') 
                : (isHindi ? '⚠️ क्षमता कम है (Undersized)' : '⚠️ Undersized for Severe Smog')}
            </span>
            <span className="text-lg font-black">
              {sizingResult.airChangesPerHour} ACH
            </span>
          </div>

          <p className="text-xs leading-relaxed mb-2">
            {sizingResult.isAdequate
              ? (isHindi 
                  ? `यह प्यूरीफायर आपके कमरे (${sizingResult.roomVolumeM3} m³) को प्रति घंटे ${sizingResult.airChangesPerHour} बार साफ करता है (मानक $\ge 4.0$ ACH पूरा)। अपेक्षित PM2.5 कमी: ~${sizingResult.expectedPM25ReductionPercent}%.`
                  : `Provides ${sizingResult.airChangesPerHour} Air Changes per Hour (exceeds the 4.0 ACH minimum). Expected indoor PM2.5 reduction: ~${sizingResult.expectedPM25ReductionPercent}%.`)
              : (isHindi
                  ? `कमरे (${sizingResult.roomVolumeM3} m³) के लिए कम से कम ${sizingResult.recommendedMinimumCADR} m³/h CADR की आवश्यकता है। अतिरिक्त फिल्टर लगाएं या कमरे को छोटा सील करें।`
                  : `Delivers only ${sizingResult.airChangesPerHour} ACH. Severe winter smog requires at least 4.0 ACH (${sizingResult.recommendedMinimumCADR} m³/h CADR). Run a secondary fan or seal a smaller room.`)}
          </p>

          <div className="text-[11px] text-slate-500 italic">
            {isHindi 
              ? 'सूत्र: ACH = CADR / कमरे का आयतन (ASHRAE Standard 241 & CDC Guidelines)' 
              : 'Formula: ACH = CADR (m³/h) / Room Volume (m³) [ASHRAE Standard 241 / CDC]'}
          </div>
        </div>
      </section>

      {/* 3. Low-Cost PM Sensor Companion */}
      <section 
        aria-labelledby="sensor-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <div>
            <h3 id="sensor-heading" className="text-sm font-bold text-slate-900">
              {t.iaq.sensorTitle}
            </h3>
            <p className="text-xs text-slate-500">{t.iaq.sensorDesc}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={sensorInput}
              onChange={(e) => setSensorInput(e.target.value)}
              placeholder="e.g. 85"
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
              aria-label="Enter indoor PM2.5 sensor reading in ug/m3"
            />
            <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">
              µg/m³
            </span>
          </div>

          <button
            type="button"
            onClick={handleEvaluateSensor}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
          >
            {isHindi ? 'जांचें' : 'Compare'}
          </button>
        </div>

        {sensorCalculated && (
          <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
            sensorCalculated.status === 'good'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : sensorCalculated.status === 'moderate'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>
                {isHindi ? 'इनडोर vs आउटडोर अनुपात (I/O Ratio):' : 'Indoor / Outdoor Infiltration Ratio:'}
              </span>
              <span className="text-sm font-black">{sensorCalculated.ratio}%</span>
            </div>
            <p className="leading-snug">
              {sensorCalculated.status === 'good'
                ? (isHindi 
                    ? `उत्कृष्ट सीलिंग! घर के अंदर बाहर (${sensorCalculated.outdoorPM} µg/m³) की तुलना में केवल ${sensorCalculated.ratio}% स्मॉग आ रहा है।`
                    : `Excellent sealing! Indoor PM2.5 (${sensorCalculated.indoorPM} µg/m³) is only ${sensorCalculated.ratio}% of outdoor air (${sensorCalculated.outdoorPM} µg/m³).`)
                : sensorCalculated.status === 'moderate'
                ? (isHindi
                    ? `मध्यम रिसाव (${sensorCalculated.ratio}%)। दरवाजों के नीचे गीला तौलिया लगाकर और खिड़कियां सील करके इसे 25% तक लाया जा सकता है।`
                    : `Moderate infiltration (${sensorCalculated.ratio}%). Place damp rolled towels on door drafts to pull this below 30%.`)
                : (isHindi
                    ? `गंभीर धुआं रिसाव (${sensorCalculated.ratio}%)! बाहर का धुआं सीधे कमरे में आ रहा है। तुरंत खिड़कियां सील करें और इनडोर स्रोत (तड़का, अगरबत्ती) जांचें।`
                    : `High smog penetration (${sensorCalculated.ratio}%)! The room is severely leaking outdoor smog. Check window latches, cooking exhaust, and door drafts.`)}
            </p>
          </div>
        )}
      </section>

      {/* 4. IAQ Myths Debunked Honestly */}
      <section 
        aria-labelledby="myths-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
          <h3 id="myths-heading" className="text-sm font-bold text-slate-900">
            {t.iaq.mythsTitle}
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="font-bold text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? 'भ्रम: "5 पौधे लगाने से कमरा HEPA जितना साफ हो जाता है"' : 'Myth: "Houseplants filter smog as well as a HEPA filter"'}</span>
            </span>
            <p className="text-slate-700">
              {isHindi
                ? 'सच्चाई: नासा का परीक्षण पूरी तरह वायुरुद्ध कांच के बक्से में हुआ था। सामान्य घर में हवा के रिसाव के सामने पौधों की PM2.5 सफाई दर शून्य के बराबर होती है।'
                : 'Truth: NASA tests were done in sealed micro-chambers on VOCs. In real homes with 0.5+ ACH air changes, you would need over 500 plants per room to equal one small HEPA filter.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="font-bold text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? 'भ्रम: "अगरबत्ती जलाने से हवा शुद्ध होती है"' : 'Myth: "Incense smoke purifies home air"'}</span>
            </span>
            <p className="text-slate-700">
              {isHindi
                ? 'सच्चाई: अगरबत्ती जलने से बेंजीन और बारीक जहरीले कण निकलते हैं, जो 15 मिनट में कमरे के PM2.5 को 500 µg/m³ तक बढ़ा देते हैं।'
                : 'Truth: Incense emits toxic benzene and ultrafine carbon soot, raising indoor PM2.5 above 500 µg/m³ within 15 minutes.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="font-bold text-red-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? 'भ्रम: "ओजोन प्यूरीफायर प्रदूषण को नष्ट कर देते हैं"' : 'Myth: "Ozone cleaners safely destroy air pollutants"'}</span>
            </span>
            <p className="text-slate-700">
              {isHindi
                ? 'सच्चाई: ओजोन फेफड़ों के ऊतकों को जलाती है और गंभीर दमा बढ़ाती है। EPA और WHO ओजोन जनरेटर के प्रयोग को दृढ़ता से मना करते हैं।'
                : 'Truth: Ozone is a lung toxin that oxidizes respiratory tissue. Both the EPA and WHO strictly advise against ozone generators in occupied spaces.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
