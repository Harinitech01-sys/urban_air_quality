export interface SafetyCheckResult {
  hasEmergencySymptoms: boolean;
  emergencyType?: 'cardiac' | 'respiratory_distress' | 'severe_hypoxia';
  infantMaskViolation: boolean;
  ozoneRiskDetected: boolean;
  carbonMonoxideRiskDetected: boolean;
  escalationMessage?: {
    en: string;
    hi: string;
  };
  warnings: {
    en: string;
    hi: string;
  }[];
}

// Emergency symptom keywords (English & Hindi)
const EMERGENCY_KEYWORDS = [
  'chest pain',
  'chest tightness',
  'heart attack',
  'cannot breathe',
  'cant breathe',
  'severe breathlessness',
  'gasping for air',
  'blue lips',
  'blue fingertips',
  'cyanosis',
  'stridor',
  'severe wheezing',
  'unconscious',
  'fainted',
  'सीने में दर्द',
  'सांस नहीं आ रही',
  'दम घुट रहा',
  'नीले होंठ',
  'बेहोश',
  'तेज घरघराहट',
];

const INFANT_KEYWORDS = [
  'infant',
  'baby',
  'newborn',
  'toddler',
  '1 year old',
  '6 month',
  '3 month',
  'नवजात',
  'शिशु',
  'छोटा बच्चा',
];

const MASK_KEYWORDS = [
  'mask',
  'n95',
  'respirator',
  'ffp2',
  'मास्क',
];

const OZONE_KEYWORDS = [
  'ozone generator',
  'ionizer purifier',
  'negative ion generator',
  'ozone cleaner',
  'ओजोन',
  'आयनाइज़र',
];

const CO_KEYWORDS = [
  'angithi',
  'coal inside',
  'charcoal heater',
  'unvented heater',
  'kerosene heater indoor',
  'लकड़ी जलाना कमरे में',
  'अंगीठी',
  'कोयला कमरे में',
];

/**
 * Deterministic safety scanner for user input or generated output.
 */
export function scanSafetyGuardrails(text: string, context?: { hasInfants?: boolean }): SafetyCheckResult {
  const normalized = text.toLowerCase();
  const warnings: { en: string; hi: string }[] = [];

  // 1. Acute Medical Emergency Triage
  let hasEmergencySymptoms = false;
  let emergencyType: 'cardiac' | 'respiratory_distress' | 'severe_hypoxia' | undefined;

  for (const kw of EMERGENCY_KEYWORDS) {
    if (normalized.includes(kw)) {
      hasEmergencySymptoms = true;
      break;
    }
  }

  if (hasEmergencySymptoms) {
    if (normalized.includes('blue') || normalized.includes('नीले') || normalized.includes('cyanosis')) {
      emergencyType = 'severe_hypoxia';
    } else if (normalized.includes('chest') || normalized.includes('सीने') || normalized.includes('heart')) {
      emergencyType = 'cardiac';
    } else {
      emergencyType = 'respiratory_distress';
    }
  }

  // 2. Infant Mask Prohibition Check
  let infantMaskViolation = false;
  const mentionsInfant = INFANT_KEYWORDS.some(kw => normalized.includes(kw)) || !!context?.hasInfants;
  const mentionsMask = MASK_KEYWORDS.some(kw => normalized.includes(kw));

  if (mentionsInfant && mentionsMask) {
    infantMaskViolation = true;
    warnings.push({
      en: 'STRICT SAFETY RULE: Masks and respirators are NEVER safe for infants under 2 years old due to airway resistance and suffocation hazard. Protect infants strictly with clean indoor air.',
      hi: 'सख्त सुरक्षा नियम: 2 वर्ष से कम उम्र के शिशुओं को कभी भी मास्क न पहनाएं (दम घुटने का खतरा)। उन्हें केवल सुरक्षित इनडोर हवा में रखें।'
    });
  }

  // 3. Ozone / Ionizer Risk Check
  const ozoneRiskDetected = OZONE_KEYWORDS.some(kw => normalized.includes(kw));
  if (ozoneRiskDetected) {
    warnings.push({
      en: 'WARNING: Ozone-generating and ionizing air cleaners produce respiratory irritants that worsen asthma and damage alveolar linings. Use only mechanical HEPA or MERV filtration.',
      hi: 'चेतावनी: ओजोन या आयनाइज़र प्यूरीफायर फेफड़ों को नुकसान पहुंचाते हैं। केवल मैकेनिकल HEPA या MERV फिल्टर का ही उपयोग करें।'
    });
  }

  // 4. Carbon Monoxide Combustion Check
  const carbonMonoxideRiskDetected = CO_KEYWORDS.some(kw => normalized.includes(kw));
  if (carbonMonoxideRiskDetected) {
    warnings.push({
      en: 'DANGER: Burning coal, wood, or charcoal in an unvented closed room causes lethal Carbon Monoxide (CO) poisoning. Never use unvented combustion heaters indoors.',
      hi: 'खतरा: बंद कमरे में अंगीठी, कोयला या लकड़ी जलाना जानलेवा कार्बन मोनोऑक्साइड पैदा करता है। कमरे में कभी खुली आग न जलाएं।'
    });
  }

  let escalationMessage;
  if (hasEmergencySymptoms) {
    escalationMessage = {
      en: 'EMERGENCY ESCALATION: The symptoms described (such as severe breathlessness, chest pain, or cyanosis) indicate acute medical distress. Please call local emergency medical services (112 / 102 / 911) or proceed immediately to the nearest emergency department. CleanBreath is not a medical provider.',
      hi: 'आपातकालीन चिकित्सा चेतावनी: वर्णित लक्षण (जैसे सीने में दर्द, सांस लेने में अत्यधिक कठिनाई या होंठ नीले पड़ना) गंभीर आपात स्थिति के संकेत हैं। कृपया तुरंत आपातकालीन एम्बुलेंस (112 / 102) को कॉल करें या निकटतम अस्पताल के इमरजेंसी विभाग में जाएं।'
    };
  }

  return {
    hasEmergencySymptoms,
    emergencyType,
    infantMaskViolation,
    ozoneRiskDetected,
    carbonMonoxideRiskDetected,
    escalationMessage,
    warnings,
  };
}
