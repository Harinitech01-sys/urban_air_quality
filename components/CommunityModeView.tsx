'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AQIData } from '@/lib/aqi/types';
import { HouseholdProfile } from '@/lib/profile/types';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  FileText, 
  Building2, 
  AlertOctagon, 
  Download, 
  Sparkles,
  Link,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface CommunityModeViewProps {
  aqiData: AQIData;
  profile: HouseholdProfile;
}

export const CommunityModeView: React.FC<CommunityModeViewProps> = ({
  aqiData,
  profile,
}) => {
  const { t, isHindi } = useI18n();
  const [activeShareTab, setActiveShareTab] = useState<'whatsapp' | 'circular' | 'rwa' | 'poster'>('whatsapp');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>('Vasant Kunj Clean Air Coalition');
  const [communityPledges, setCommunityPledges] = useState<Record<string, number>>({
    school_carpool: 24,
    wet_mop_only: 48,
    zero_leaf_burn: 62,
    clean_cooking: 18,
  });

  const handleCopy = (text: string, tabId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTab(tabId);
      setTimeout(() => setCopiedTab(null), 2500);
    }
  };

  // Content templates calibrated to live AQI
  const whatsappContent = isHindi 
    ? `🚨 *स्मॉग अलर्ट: ${profile.location.city}* 🚨
वायु गुणवत्ता सूचकांक: *AQI ${aqiData.aqi} (${aqiData.categoryLabel.hi})*
प्रमुख प्रदूषक: PM2.5 (${aqiData.pollutants.pm25} µg/m³)

⚠️ *आज के 4 आवश्यक कदम:*
1. सुबह 6 से 9:30 बजे तक खिड़कियां कसकर बंद रखें (इनवर्जन सक्रिय)।
2. बच्चों और बुजुर्गों की बाहरी सैर/खेल रद्द करें।
3. बाहर निकलते समय प्रमाणित N95 मास्क पहनें (कपड़े का मास्क PM2.5 नहीं रोकता)।
4. झाड़ू के बजाय गीला पोछा लगाएं और अगरबत्ती न जलाएं।

🕒 *आज हवा बदलने का सबसे सही समय:* ${aqiData.bestCleanAirWindowToday.start} से ${aqiData.bestCleanAirWindowToday.end} (केवल 15 मिनट)।

सामुदायिक स्वच्छ वायु कार्य योजना: CleanBreath Web App से साझा किया गया।`
    : `🚨 *SMOG ALERT: ${profile.location.city}* 🚨
Air Quality Index: *AQI ${aqiData.aqi} (${aqiData.categoryLabel.en})*
Dominant Pollutant: PM2.5 (${aqiData.pollutants.pm25} µg/m³)

⚠️ *4 Immediate Community Actions:*
1. Keep windows tightly sealed this morning (nocturnal surface inversion active).
2. Move children's sports and elderly morning walks strictly indoors.
3. Wear a certified, well-fitted N95 respirator outdoors (cloth masks filter <15%).
4. Switch to wet mopping; avoid dry sweeping and burning incense.

🕒 *Clean Air Window for Room Airing:* ${aqiData.bestCleanAirWindowToday.start} – ${aqiData.bestCleanAirWindowToday.end} (15 mins only).

Shared via CleanBreath Community Action Portal.`;

  const circularContent = isHindi
    ? `आधिकारिक सूचना: गंभीर शीतकालीन स्मॉग परामर्श
स्कूल / कॉलेज प्रशासन: ${groupName}
दिनांक: ${new Date().toLocaleDateString('hi-IN')}

प्रिय अभिभावक एवं शिक्षकगण,

वर्तमान में हमारे क्षेत्र में वायु गुणवत्ता सूचकांक AQI ${aqiData.aqi} (गंभीर स्तर) दर्ज किया गया है। छात्रों के श्वसन स्वास्थ्य की सुरक्षा हेतु निम्नलिखित दिशानिर्देश तत्काल प्रभाव से लागू किए जाते हैं:

1. सभी बाहरी खेलकूद, असेंबली (प्रार्थना सभा) और पीई कक्षाएं निलंबित कर इनडोर हॉल में आयोजित की जाएंगी।
2. सभी छात्र और कर्मचारी स्कूल आते व जाते समय प्रमाणित N95/KF94 मास्क का अनिवार्य उपयोग करें। (ध्यान दें: 2 वर्ष से कम उम्र के शिशुओं को मास्क न पहनाएं)।
3. स्कूल वैन और बसों को स्कूल परिसर में इंजन बंद (No Idling) रखने का निर्देश दिया गया है। अभिभावकों से कारपूलिंग का अनुरोध है।
4. अस्थमा या श्वसन संवेदनशीलता वाले छात्रों को चिकित्सा सलाह अनुसार इनहेलर साथ रखने की अनुमति है।

हस्ताक्षर,
प्रिंसिपल / प्रशासनिक अधिकारी`
    : `OFFICIAL ADVISORY: WINTER SMOG EPISODE MITIGATION
Institution / School Administration: ${groupName}
Date: ${new Date().toLocaleDateString()}

Dear Parents, Faculty, and Guardians,

Outdoor ambient air quality in our district has reached AQI ${aqiData.aqi} (${aqiData.categoryLabel.en}, PM2.5: ${aqiData.pollutants.pm25} µg/m³). To safeguard developing pediatric pulmonary health, the following protocols are enacted immediately:

1. All outdoor physical education (PE), soccer practice, and morning assembly sessions are relocated indoors.
2. Students over age 2 and staff commuting on foot or transit are strongly advised to wear a certified, well-fitted N95/KF94 respirator.
3. A strict "No-Idling" policy is enforced across all school pickup and drop-off gates. Parents are urged to coordinate shared carpools.
4. Children with diagnosed asthma or reactive airways must have their rescue inhaler on person.

Authorized by: Clean Air Advisory Committee`;

  const rwaContent = isHindi
    ? `RWA रेजिडेंट वेलफेयर एसोसिएशन नोटिस
स्थान: ${groupName}

सभी निवासियों से अपील:
क्षेत्र का AQI ${aqiData.aqi} पहुंच चुका है। प्रदूषण रोकथाम हेतु सामूहिक नियम:
1. सूखे पत्तों, कचरे या प्लास्टिक को जलाने पर पूर्ण प्रतिबंध है। उल्लंघन करने वालों पर तुरंत जुर्माना लगाया जाएगा।
2. सिक्योरिटी गार्ड्स को बंद कमरों में अंगीठी या कोयला जलाने की सख्त मनाही है। उन्हें इलेक्ट्रिक हीटर प्रदान किए जा रहे हैं।
3. कॉमन कॉरिडोर में सूखी झाड़ू के बजाय केवल गीला पोछा लगाया जाएगा।
4. कारपूलिंग बोर्ड पर अपना रूट साझा करें।`
    : `RWA RESIDENTS WELFARE ASSOCIATION NOTICE
Neighborhood: ${groupName}

Urgent Air Quality Action Plan:
Current local AQI stands at ${aqiData.aqi} (${aqiData.categoryLabel.en}). All residents and facility managers must adhere to the following:
1. STRICT BAN on open biomass, garden trimming, and plastic burning. Immediate municipal penalties apply.
2. Security staff are strictly prohibited from burning coal/wood in closed cabins due to fatal Carbon Monoxide risks. Ceramic electric radiators are issued.
3. Housekeeping must strictly transition to wet mopping and HEPA vacuuming in stairwells and common areas; no dry broom sweeping.
4. Coordinate with neighbors on the school carpool board.`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t.community.title}</h2>
              <p className="text-xs text-slate-500">{t.community.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Group Banner */}
      <section 
        aria-label="Active community group"
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {isHindi ? 'सक्रिय समुदाय समूह' : 'Active Community Group'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {groupName}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(`https://cleanbreath.app/group/${encodeURIComponent(groupName)}`, 'link')}
            className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-300 flex items-center gap-1"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{copiedTab === 'link' ? (isHindi ? 'लिंक कॉपी!' : 'Link Copied!') : (isHindi ? 'आमंत्रण लिंक' : 'Invite Link')}</span>
          </button>
        </div>

        {/* Aggregated Community Impact Rollup */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-slate-800">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <span className="text-2xl font-black text-emerald-950 block">
              3,450 kg
            </span>
            <span className="text-[11px] font-semibold text-emerald-800">
              {isHindi ? 'सामूहिक बची हुई CO2' : 'Collective Avoided CO2'}
            </span>
          </div>

          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200">
            <span className="text-2xl font-black text-teal-950 block">
              18.2 kg
            </span>
            <span className="text-[11px] font-semibold text-teal-800">
              {isHindi ? 'बचा हुआ विषैला PM2.5' : 'Collective Avoided PM2.5'}
            </span>
          </div>
        </div>

        {/* Collective Pledges Counters */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-800 block">
            {t.community.pledges}:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">{isHindi ? 'स्कूल कारपूलिंग' : 'School Carpools'}</span>
              <span className="font-bold text-teal-800">{communityPledges.school_carpool} {isHindi ? 'परिवार' : 'homes'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">{isHindi ? 'केवल गीला पोछा' : 'Wet Mop Only'}</span>
              <span className="font-bold text-teal-800">{communityPledges.wet_mop_only} {isHindi ? 'घर' : 'homes'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">{isHindi ? 'जीरो कचरा दहन' : 'Zero Leaf Burn'}</span>
              <span className="font-bold text-teal-800">{communityPledges.zero_leaf_burn} {isHindi ? 'निवासी' : 'pledged'}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">{isHindi ? 'स्वच्छ रसोई ईंधन' : 'Clean Cooking'}</span>
              <span className="font-bold text-teal-800">{communityPledges.clean_cooking} {isHindi ? 'परिवार' : 'homes'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Community Broadcast Studio */}
      <section 
        aria-labelledby="broadcast-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h3 id="broadcast-heading" className="text-sm font-bold text-slate-900">
              {t.community.generateContent}
            </h3>
          </div>
        </div>

        {/* Studio Tabs */}
        <div 
          role="tablist"
          className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold"
        >
          <button
            type="button"
            onClick={() => setActiveShareTab('whatsapp')}
            className={`py-1.5 px-1 rounded-lg text-center truncate ${
              activeShareTab === 'whatsapp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setActiveShareTab('circular')}
            className={`py-1.5 px-1 rounded-lg text-center truncate ${
              activeShareTab === 'circular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isHindi ? 'सर्कुलर' : 'Circular'}
          </button>
          <button
            type="button"
            onClick={() => setActiveShareTab('rwa')}
            className={`py-1.5 px-1 rounded-lg text-center truncate ${
              activeShareTab === 'rwa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            RWA
          </button>
          <button
            type="button"
            onClick={() => setActiveShareTab('poster')}
            className={`py-1.5 px-1 rounded-lg text-center truncate ${
              activeShareTab === 'poster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {isHindi ? 'अलर्ट कार्ड' : 'Card'}
          </button>
        </div>

        {/* Tab 1: WhatsApp Advisory */}
        {activeShareTab === 'whatsapp' && (
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs whitespace-pre-wrap text-slate-800 max-h-56 overflow-y-auto">
              {whatsappContent}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(whatsappContent, 'whatsapp')}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copiedTab === 'whatsapp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTab === 'whatsapp' ? t.community.copied : t.community.copy}</span>
            </button>
          </div>
        )}

        {/* Tab 2: School Circular Draft */}
        {activeShareTab === 'circular' && (
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans text-xs whitespace-pre-wrap text-slate-800 max-h-56 overflow-y-auto">
              {circularContent}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(circularContent, 'circular')}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copiedTab === 'circular' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTab === 'circular' ? t.community.copied : t.community.copy}</span>
            </button>
          </div>
        )}

        {/* Tab 3: RWA Action Notice */}
        {activeShareTab === 'rwa' && (
          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-sans text-xs whitespace-pre-wrap text-slate-800 max-h-56 overflow-y-auto">
              {rwaContent}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(rwaContent, 'rwa')}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copiedTab === 'rwa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTab === 'rwa' ? t.community.copied : t.community.copy}</span>
            </button>
          </div>
        )}

        {/* Tab 4: Printable Poster & Graphic Card */}
        {activeShareTab === 'poster' && (
          <div className="space-y-3">
            <div 
              id="printable-smog-card"
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 border-2 border-red-500 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
                  ⚠️ SMOG EMERGENCY ALERT
                </span>
                <span className="text-xs text-slate-400 font-bold">{profile.location.city}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-5xl font-black tracking-tight text-white">{aqiData.aqi}</span>
                  <span className="text-xs font-bold text-red-400 block uppercase">
                    {isHindi ? aqiData.categoryLabel.hi : aqiData.categoryLabel.en}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dominant</span>
                  <span className="font-bold text-slate-200">PM2.5: {aqiData.pollutants.pm25} µg/m³</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 text-xs text-slate-200 space-y-1">
                <div className="font-bold text-teal-300">✓ Clean Air Sanctuary Window:</div>
                <div>{aqiData.bestCleanAirWindowToday.start} – {aqiData.bestCleanAirWindowToday.end}</div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-800">
                Generated with CleanBreath (PWA) • Local Community Action
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(isHindi ? 'पोस्टर कार्ड प्रिंट डायलॉग खुल रहा है...' : 'Printing / Saving Smog Alert Card...')}
              className="w-full py-2.5 px-4 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-xl flex items-center justify-center gap-1.5 border border-teal-300"
            >
              <Download className="w-4 h-4" />
              <span>{isHindi ? 'स्मॉग अलर्ट कार्ड डाउनलोड / प्रिंट करें' : 'Download / Print Smog Alert Card'}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
