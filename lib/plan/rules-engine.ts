import { HouseholdProfile } from '@/lib/profile/types';
import { AQIData } from '@/lib/aqi/types';
import { DailyPlan, PlanRecommendation } from './types';

export function generateRulesBasedPlan(profile: HouseholdProfile, aqiData: AQIData): DailyPlan {
  const aqi = aqiData.aqi;
  const isSevere = aqi > 250;
  const isUnhealthy = aqi > 150;
  const hasVulnerable = 
    profile.household.hasInfants || 
    profile.household.childrenAgeBands.length > 0 || 
    profile.household.hasElderly || 
    profile.household.hasRespiratoryCondition;

  const recommendations: PlanRecommendation[] = [];

  // 1. MORNING BLOCK (6:00 AM - 9:00 AM)
  if (isUnhealthy) {
    recommendations.push({
      id: 'rec_morning_seal',
      timeBlock: 'morning',
      timeLabel: { en: 'Early Morning (6:00 - 9:00 AM)', hi: 'सुबह (6:00 - 9:00 AM)' },
      category: 'ventilation',
      action: {
        en: 'Keep all windows tightly latched. Place rolled damp towels along door bottoms and drafty sill gaps.',
        hi: 'सभी खिड़कियां कसकर बंद रखें। दरवाजों के नीचे और खिड़कियों की दरारों पर गीला तौलिया लगाएं।'
      },
      why: {
        en: 'Ground-level thermal inversion traps toxic particulate matter near the surface overnight and in the early hours.',
        hi: 'रात और सुबह की ठंड से जहरीला धुआं और धूल जमीन के पास ही जमा रहता है (थर्मल इनवर्जन)।'
      },
      estimatedImpact: {
        en: 'Reduces indoor PM2.5 infiltration by 30% to 55%',
        hi: 'घर के अंदर आने वाले PM2.5 को 30% से 55% तक रोकता है',
        inhalationReductionPercent: 42
      },
      cost: 'free',
      confidence: 'High',
      assumptions: {
        en: 'Assumes typical natural infiltration air change rate of 0.8 ACH dropping to 0.4 ACH when gaps are sealed.',
        hi: 'दरारें सील करने से कमरे में हवा का रिसाव 0.8 ACH से घटकर 0.4 ACH हो जाता है।'
      }
    });

    if (hasVulnerable) {
      recommendations.push({
        id: 'rec_morning_exercise',
        timeBlock: 'morning',
        timeLabel: { en: 'Morning Exercise & Outdoor Stroll', hi: 'सुबह की सैर और व्यायाम' },
        category: 'activity',
        action: {
          en: 'Cancel outdoor morning walks, jogging, and yoga. Substitute with light indoor stretching.',
          hi: 'सुबह की बाहरी सैर, दौड़ना या पार्क में योग स्थगित करें। घर के अंदर ही हल्के व्यायाम करें।'
        },
        why: {
          en: 'Brisk exertion triples your respiratory volume (from 8 L/min to 25+ L/min), forcing particulate matter deep into alveoli.',
          hi: 'तेज चलने या दौड़ने से फेफड़ों में 3 गुना अधिक हवा खिंचती है (8 L/min से 25+ L/min), जिससे जहरीले कण फेफड़ों में गहरे चले जाते हैं।'
        },
        estimatedImpact: {
          en: 'Avoids 85% to 92% of morning peak toxic inhalation (~180 µg PM2.5 saved)',
          hi: 'सुबह के अधिकतम प्रदूषण में 85% से 92% जहरीले कण अंदर जाने से बचते हैं',
          inhalationReductionPercent: 88
        },
        cost: 'free',
        confidence: 'High',
        assumptions: {
          en: 'Calculated over 45 minutes of brisk walking vs resting indoor inhalation at AQI 350.',
          hi: 'AQI 350 पर 45 मिनट तेज चलने बनाम घर में आराम करने के आधार पर गणना।'
        }
      });
    }
  } else {
    recommendations.push({
      id: 'rec_morning_moderate',
      timeBlock: 'morning',
      timeLabel: { en: 'Early Morning (6:00 - 9:00 AM)', hi: 'सुबह (6:00 - 9:00 AM)' },
      category: 'ventilation',
      action: {
        en: 'Moderate outdoor air; keep windows closed during rush-hour traffic.',
        hi: 'मध्यम वायु स्तर; सुबह के भारी ट्रैफिक के समय खिड़कियां बंद रखें।'
      },
      why: {
        en: 'Vehicle exhaust creates sharp local NO2 and black carbon spikes between 7:30 and 9:00 AM.',
        hi: 'वाहनों का धुआं सुबह 7:30 से 9:00 के बीच NO2 और काले धुएं का स्तर अचानक बढ़ा देता है।'
      },
      estimatedImpact: {
        en: 'Cuts morning NO2 exposure by 20% to 35%',
        hi: 'सुबह के NO2 प्रदूषण को 20% से 35% तक कम करता है',
        inhalationReductionPercent: 28
      },
      cost: 'free',
      confidence: 'Moderate',
      assumptions: {
        en: 'Roadside proximity buffer of 150m and traffic flow diurnal distribution.',
        hi: 'सड़क से 150 मीटर की दूरी और सामान्य ट्रैफिक के आधार पर।'
      }
    });
  }

  // 2. COMMUTE BLOCK (9:00 AM - 10:30 AM)
  if (profile.commute.primaryMode === 'twowheeler' || profile.commute.primaryMode === 'walk_cycle') {
    recommendations.push({
      id: 'rec_commute_twowheeler',
      timeBlock: 'commute',
      timeLabel: { en: 'Morning Commute (9:00 - 10:30 AM)', hi: 'सुबह की यात्रा (9:00 - 10:30 AM)' },
      category: 'mask',
      action: {
        en: 'Wear a certified, tight-fitting N95 / FFP2 respirator. Ensure the metal nose clip is crimped firmly.',
        hi: 'प्रमाणित और सही फिटिंग वाला N95 / FFP2 मास्क पहनें। नाक की धातु की क्लिप को कसकर दबाएं।'
      },
      why: {
        en: 'Two-wheeler and pedestrian commuters travel directly in the tailpipe plume of trucks, buses, and diesel vehicles.',
        hi: 'बाइक और पैदल चलने वाले सीधे वाहनों के साइलेंसर से निकलने वाले काले धुएं के संपर्क में होते हैं।'
      },
      estimatedImpact: {
        en: 'Filters 85% to 95% of fine PM2.5 when well fitted (Cloth masks filter < 20%)',
        hi: 'सही फिट होने पर 85% से 95% तक बारीक PM2.5 को छानता है (कपड़े का मास्क 20% से भी कम रोकता है)',
        inhalationReductionPercent: 90
      },
      cost: 'low',
      confidence: 'High',
      assumptions: {
        en: 'NIOSH N95 filter efficiency (95%) with 5-10% typical fit leakage vs unmasked baseline.',
        hi: 'NIOSH N95 मानक दक्षता (95%) और सामान्य 5-10% फिटिंग लीकेज के आधार पर।'
      }
    });
  } else if (profile.commute.primaryMode === 'car') {
    recommendations.push({
      id: 'rec_commute_car',
      timeBlock: 'commute',
      timeLabel: { en: 'Morning Commute (9:00 - 10:30 AM)', hi: 'सुबह की यात्रा (9:00 - 10:30 AM)' },
      category: 'commute',
      action: {
        en: 'Set car climate control strictly to "Air Recirculation" mode before entering traffic.',
        hi: 'ट्रैफिक में प्रवेश करने से पहले कार के एसी को अनिवार्य रूप से "Air Recirculation" मोड पर सेट करें।'
      },
      why: {
        en: 'Fresh-air intake draws toxic roadside exhaust straight into the cabin; recirculation runs air repeatedly through the cabin filter.',
        hi: 'फ्रेश-एयर मोड बाहर के धुएं को सीधे कार में खींचता है, जबकि रीसर्कुलेशन मोड कार की हवा को बार-बार फिल्टर करता है।'
      },
      estimatedImpact: {
        en: 'Reduces in-cabin PM2.5 by 60% to 80% within 10 minutes',
        hi: '10 मिनट के अंदर केबिन के PM2.5 को 60% से 80% तक घटा देता है',
        inhalationReductionPercent: 70
      },
      cost: 'free',
      confidence: 'High',
      assumptions: {
        en: 'Cabin volume exchange tests published in Atmospheric Environment (Ding et al., 2016).',
        hi: 'वायुमंडलीय पर्यावरण अनुसंधान (डिंग एवं अन्य, 2016) के केबिन परीक्षणों पर आधारित।'
      }
    });
  } else {
    recommendations.push({
      id: 'rec_commute_transit',
      timeBlock: 'commute',
      timeLabel: { en: 'Morning Commute (9:00 - 10:30 AM)', hi: 'सुबह की यात्रा (9:00 - 10:30 AM)' },
      category: 'commute',
      action: {
        en: 'Continue using Metro / Bus; wear an N95 while waiting at elevated or outdoor transit platforms.',
        hi: 'मेट्रो या बस का उपयोग जारी रखें; खुले बस स्टॉप या प्लेटफॉर्म पर N95 मास्क पहने रखें।'
      },
      why: {
        en: 'Mass transit avoids individual carbon and brake dust emissions while underground stations buffer from surface smog.',
        hi: 'सार्वजनिक परिवहन प्रति व्यक्ति उत्सर्जन घटाता है और भूमिगत स्टेशन सतह के स्मॉग से सुरक्षित रखते हैं।'
      },
      estimatedImpact: {
        en: 'Avoids ~2.4 kg CO2 and 1.8g PM emissions compared to driving a private car',
        hi: 'कार चलाने की तुलना में ~2.4 kg CO2 और 1.8g PM उत्सर्जन की बचत',
        avoidedCo2Kg: 2.4,
        avoidedPmGrams: 1.8
      },
      cost: 'free',
      confidence: 'High',
      assumptions: {
        en: 'Based on 15km round trip commute at 160g CO2/km (petrol car) vs 25g CO2/km (metro).',
        hi: '15 किमी की यात्रा पर पेट्रोल कार (160g/किमी) बनाम मेट्रो (25g/किमी) के आधार पर।'
      }
    });
  }

  // 3. MIDDAY & SCHOOL / WORK BLOCK (10:30 AM - 4:00 PM)
  const bestWindow = aqiData.bestCleanAirWindowToday;
  recommendations.push({
    id: 'rec_midday_window',
    timeBlock: 'school_work',
    timeLabel: { en: 'Midday Clean Air Window (12:00 - 3:00 PM)', hi: 'दोपहर की स्वच्छ हवा की खिड़की (12:00 - 3:00 PM)' },
    category: 'ventilation',
    action: {
      en: `If airing out rooms is needed, open opposite windows for brief 15-minute cross-ventilation between ${bestWindow.start} and ${bestWindow.end}.`,
      hi: `यदि कमरों में ताजी हवा की आवश्यकता हो, तो ${bestWindow.start} से ${bestWindow.end} के बीच केवल 15 मिनट के लिए आमने-सामने की खिड़कियां खोलें।`
    },
    why: {
      en: 'Solar radiation warms the ground, expanding the planetary boundary layer height to its maximum and diluting pollutant concentration.',
      hi: 'दोपहर की धूप से जमीन गर्म होती है और प्रदूषक वातावरण में ऊपर उठकर बिखर जाते हैं (बाउंड्री लेयर का फैलाव)।'
    },
    estimatedImpact: {
      en: 'Flushes indoor CO2 and VOC build-up with 40% lower PM2.5 compared to morning air',
      hi: 'सुबह की तुलना में 40% कम PM2.5 के साथ कमरे की बासी CO2 और गैसों को बाहर निकालता है',
      inhalationReductionPercent: 40
    },
    cost: 'free',
    confidence: 'Moderate',
    assumptions: {
      en: 'Forecast model boundary layer elevation from 280m at dawn to ~850m at 2:00 PM.',
      hi: 'सुबह 280 मीटर से दोपहर 2:00 बजे ~850 मीटर तक बाउंड्री लेयर बढ़ने के मॉडल पर आधारित।'
    }
  });

  // 4. EVENING COMMUTE & RETURNING HOME (4:00 PM - 7:00 PM)
  recommendations.push({
    id: 'rec_evening_transit',
    timeBlock: 'evening',
    timeLabel: { en: 'Late Afternoon & Return (4:00 - 7:00 PM)', hi: 'शाम व घर वापसी (4:00 - 7:00 PM)' },
    category: 'activity',
    action: {
      en: 'Ensure children, pregnant women, and elderly return indoors before sunset (~5:30 PM). Wipe down outer clothing upon entry.',
      hi: 'बच्चों, गर्भवती महिलाओं और बुजुर्गों को सूर्यास्त (~5:30 PM) से पहले घर के अंदर बुला लें। घर आते ही बाहरी कपड़ों को झाड़ लें।'
    },
    why: {
      en: 'As the sun sets, ground cooling triggers a rapid inversion cap, trapping evening rush hour exhaust close to human breathing height.',
      hi: 'सूरज ढलते ही तापमान तेजी से गिरता है और शाम के ट्रैफिक का धुआं जमीन के पास कैद हो जाता है।'
    },
    estimatedImpact: {
      en: 'Prevents second daily inhalation peak; removes coarse settled toxic soot from living spaces',
      hi: 'दिन के दूसरे प्रदूषण पीक से बचाव; सोफे व बिस्तर पर जहरीली कालिख जमा होने से रोकता है',
      inhalationReductionPercent: 45
    },
    cost: 'free',
    confidence: 'High',
    assumptions: {
      en: 'Inversion layer collapse timeline verified by SAFAR and CPCB hourly aerosol monitor trends.',
      hi: 'SAFAR और CPCB के प्रति घंटा वायु गुणवत्ता आंकड़ों के आधार पर।'
    }
  });

  // 5. DINNER & COOKING BLOCK (7:00 PM - 9:30 PM)
  if (profile.home.cookingFuel === 'biomass') {
    recommendations.push({
      id: 'rec_cooking_biomass',
      timeBlock: 'dinner',
      timeLabel: { en: 'Evening Cooking & Dinner (7:00 - 9:30 PM)', hi: 'रात का भोजन व रसोई (7:00 - 9:30 PM)' },
      category: 'cooking',
      action: {
        en: 'Never burn wood or dung cakes indoors in a closed room. Cook in a ventilated semi-open area or use a clean cookstove / induction.',
        hi: 'बंद कमरे में कभी भी लकड़ी, उपले या कोयला न जलाएं। खुली हवादार जगह में खाना बनाएं या बिजली के चूल्हे का उपयोग करें।'
      },
      why: {
        en: 'Biomass combustion generates lethal indoor PM2.5 spikes (> 1,200 µg/m³) and Carbon Monoxide (CO), causing acute asphyxiation and severe lung inflammation.',
        hi: 'लकड़ी और उपलों से अत्यधिक जहरीला PM2.5 (>1,200 µg/m³) और कार्बन मोनोऑक्साइड गैस निकलती है जो फेफड़ों को गंभीर नुकसान पहुंचाती है।'
      },
      estimatedImpact: {
        en: 'Prevents extreme indoor PM2.5 spikes of 800 - 1500 µg/m³; eliminates acute CO poisoning risk',
        hi: '800 से 1500 µg/m³ तक के खतरनाक इनडोर प्रदूषण से बचाता है और CO के खतरे को समाप्त करता है',
        inhalationReductionPercent: 85
      },
      cost: 'low',
      confidence: 'High',
      assumptions: {
        en: 'WHO Indoor Air Quality Guidelines for household fuel combustion (WHO, 2014).',
        hi: 'घरेलू ईंधन दहन के लिए विश्व स्वास्थ्य संगठन (WHO) के इनडोर वायु दिशा-निर्देश।'
      }
    });
  } else {
    recommendations.push({
      id: 'rec_cooking_exhaust',
      timeBlock: 'dinner',
      timeLabel: { en: 'Evening Cooking & Dinner (7:00 - 9:30 PM)', hi: 'रात का भोजन व रसोई (7:00 - 9:30 PM)' },
      category: 'cooking',
      action: {
        en: 'Run the kitchen exhaust hood on HIGH for the entire cooking duration and keep kitchen doors closed from living/sleeping areas.',
        hi: 'खाना पकाते समय रसोई का एग्जॉस्ट फैन हमेशा तेज चलाएं और रसोई का दरवाजा बाकी कमरों से बंद रखें।'
      },
      why: {
        en: 'Frying and tempering oils aerosolize ultra-fine oil droplets and polycyclic aromatic hydrocarbons (PAHs) that linger in bedrooms for hours.',
        hi: 'तड़का लगाने और तलने से तेल के बेहद बारीक कण हवा में फैल जाते हैं जो घंटों तक बेडरूम में बने रहते हैं।'
      },
      estimatedImpact: {
        en: 'Extracts 65% to 85% of cooking aerosols before they enter family bedrooms',
        hi: '65% से 85% तक रसोई के धुएं और तेल के कणों को बाकी कमरों में फैलने से पहले बाहर निकालता है',
        inhalationReductionPercent: 75
      },
      cost: 'free',
      confidence: 'High',
      assumptions: {
        en: 'Lawrence Berkeley National Laboratory capture efficiency studies on residential range hoods.',
        hi: 'लॉरेंस बर्कले नेशनल लेबोरेटरी के किचन एग्जॉस्ट दक्षता अध्ययनों के आधार पर।'
      }
    });
  }

  // 6. OVERNIGHT SLEEP BLOCK (9:30 PM - 6:00 AM)
  if (profile.home.purifierType === 'none') {
    recommendations.push({
      id: 'rec_night_clean_room',
      timeBlock: 'night',
      timeLabel: { en: 'Overnight Sleep (9:30 PM - 6:00 AM)', hi: 'रात की नींद (9:30 PM - 6:00 AM)' },
      category: 'filtration',
      action: {
        en: 'Designate the smallest bedroom as your "Clean Air Sanctuary". Seal doors with damp cloths and run wet-mop on floors (never dry sweep).',
        hi: 'सबसे छोटे बेडरूम को "स्वच्छ वायु कक्ष" बनाएं। दरवाजों को गीले कपड़े से सील करें और फर्श पर गीला पोछा लगाएं (सूखी झाड़ू न लगाएं)।'
      },
      why: {
        en: 'Dry sweeping resuspends deposited toxic heavy metal particles back into the air. Sleeping in a compact sealed room minimizes total volume of smog inhaled during 8 hours of rest.',
        hi: 'सूखी झाड़ू लगाने से जमीन पर बैठी धूल दोबारा हवा में उड़ जाती है। सील किए गए कमरे में सोने से 8 घंटे की नींद में जहरीली हवा का सांस में जाना कम होता है।'
      },
      estimatedImpact: {
        en: 'Cuts 8-hour cumulative nocturnal PM2.5 inhalation by 25% to 40% with zero expenditure',
        hi: 'बिना किसी खर्च के 8 घंटे की रात की नींद में सांस में जाने वाले PM2.5 को 25% से 40% तक घटाता है',
        inhalationReductionPercent: 35
      },
      cost: 'free',
      confidence: 'High',
      assumptions: {
        en: 'Particle resuspension kinetics (Thatcher & Layton, 1995) and chamber sealing studies.',
        hi: 'पार्टिकल री-सस्पेंशन और सीलिंग अनुसंधान के आधार पर।'
      }
    });
  } else {
    recommendations.push({
      id: 'rec_night_purifier',
      timeBlock: 'night',
      timeLabel: { en: 'Overnight Sleep (9:30 PM - 6:00 AM)', hi: 'रात की नींद (9:30 PM - 6:00 AM)' },
      category: 'filtration',
      action: {
        en: 'Run your purifier on Medium speed placed 1 meter away from bed headboards. Keep bedroom door and windows completely shut.',
        hi: 'प्यूरीफायर को सिरहाने से 1 मीटर दूर मध्यम गति पर चलाएं। बेडरूम का दरवाजा और खिड़कियां पूरी तरह बंद रखें।'
      },
      why: {
        en: 'Running on "Auto" often under-cleans at night because sensors misjudge diffuse fine particulates. Continuous medium speed provides consistent clean air changes (ACH > 4.0).',
        hi: '"Auto" मोड पर सेंसर अक्सर बारीक धूल को नहीं पहचान पाते और गति धीमी रखते हैं। मीडियम स्पीड लगातार 4+ एयर चेंज प्रदान करती है।'
      },
      estimatedImpact: {
        en: 'Maintains bedroom PM2.5 under 15-25 µg/m³ (down from 250+ outdoor level: 90%+ drop)',
        hi: 'बेडरूम के PM2.5 को 15-25 µg/m³ के सुरक्षित स्तर पर बनाए रखता है (90%+ की भारी कमी)',
        inhalationReductionPercent: 92
      },
      cost: 'low',
      confidence: 'High',
      assumptions: {
        en: 'CADR rating of 250 m3/h in a 12m x 10m x 9ft bedroom yielding 4.2 air changes per hour.',
        hi: '12x10x9 फीट के बेडरूम में 250 m3/h CADR वाले प्यूरीफायर द्वारा प्रति घंटे 4.2 एयर चेंज के आधार पर।'
      }
    });
  }

  return {
    id: `plan_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    isAIGenerated: false,
    aqiSnapshot: aqi,
    recommendations,
    summaryNote: {
      en: `Deterministic rule-based routine calibrated for ${profile.location.city} at AQI ${aqi} (${aqiData.categoryLabel.en}). Prioritizes zero-cost sealing, ventilation timing, and respiratory protection.`,
      hi: `${profile.location.city} में AQI ${aqi} के लिए निर्धारित नियम-आधारित दिनचर्या। यह बिना खर्च वाली सीलिंग, सही समय पर खिड़की खोलने और सांस की सुरक्षा को प्राथमिकता देती है।`
    }
  };
}
