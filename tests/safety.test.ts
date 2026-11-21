import { describe, it, expect } from 'vitest';
import { scanSafetyGuardrails } from '../lib/safety/guardrails';

describe('Safety & Medical Escalation Guardrails', () => {
  it('detects cardiac emergency symptoms in English', () => {
    const res = scanSafetyGuardrails('My grandfather is having severe chest pain and breathlessness');
    expect(res.hasEmergencySymptoms).toBe(true);
    expect(res.emergencyType).toBe('cardiac');
    expect(res.escalationMessage).toBeDefined();
    expect(res.escalationMessage?.en).toContain('EMERGENCY ESCALATION');
  });

  it('detects acute hypoxia symptoms in Hindi', () => {
    const res = scanSafetyGuardrails('मरीज के नीले होंठ हो रहे हैं और सांस नहीं आ रही');
    expect(res.hasEmergencySymptoms).toBe(true);
    expect(res.emergencyType).toBe('severe_hypoxia');
    expect(res.escalationMessage).toBeDefined();
    expect(res.escalationMessage?.hi).toContain('आपातकालीन चिकित्सा चेतावनी');
  });

  it('triggers infant mask prohibition rule', () => {
    const res = scanSafetyGuardrails('Can I put an N95 mask on my 6 month old infant baby?');
    expect(res.infantMaskViolation).toBe(true);
    expect(res.warnings.some(w => w.en.includes('NEVER safe for infants under 2 years'))).toBe(true);
  });

  it('flags dangerous ozone generator air cleaners', () => {
    const res = scanSafetyGuardrails('Should I buy an ozone generator cleaner for my room?');
    expect(res.ozoneRiskDetected).toBe(true);
    expect(res.warnings.some(w => w.en.includes('Ozone-generating'))).toBe(true);
  });

  it('flags fatal carbon monoxide indoor heating risk', () => {
    const res = scanSafetyGuardrails('सर्दी बहुत है क्या बंद कमरे में अंगीठी जला सकते हैं?');
    expect(res.carbonMonoxideRiskDetected).toBe(true);
    expect(res.warnings.some(w => w.hi.includes('कार्बन मोनोऑक्साइड'))).toBe(true);
  });

  it('allows safe environmental and ventilation queries with zero false alarms', () => {
    const res = scanSafetyGuardrails('What is the best time to open windows during midday?');
    expect(res.hasEmergencySymptoms).toBe(false);
    expect(res.infantMaskViolation).toBe(false);
    expect(res.ozoneRiskDetected).toBe(false);
    expect(res.carbonMonoxideRiskDetected).toBe(false);
    expect(res.warnings.length).toBe(0);
  });
});
