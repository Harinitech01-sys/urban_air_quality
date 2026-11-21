# Architectural & Design Decisions (DECISIONS.md)

This log documents all architectural choices, assumptions, trade-offs, and defaults adopted in CleanBreath.

---

## DEC-001: Next.js 14 App Router with Client-Side Privacy First
- **Date**: 2026-11-20
- **Context**: Users in severe winter smog areas include vulnerable populations (asthmatics, elderly, low-income families) who require immediate, low-latency assistance on budget phones and potentially unstable connections.
- **Decision**: Next.js 14 App Router with client-side localStorage/IndexedDB as the primary profile store, backed by service worker caching. An explicit "Delete My Data" button purges all storage instantly with no remote trace.
- **Consequences**: Fast startup, zero server storage of personally identifiable medical or household info, works smoothly offline.

---

## DEC-002: Deterministic Impact Calculator as Single Source of Truth
- **Date**: 2026-11-20
- **Context**: LLMs frequently hallucinate numbers, percentages, and scientific estimates. Users must be able to trust inhaled PM2.5 and avoided emission values.
- **Decision**: All numbers, ranges, and formulas are computed strictly by `/lib/impact/calculator.ts` using peer-reviewed EPA, WHO, SAFAR, and CPCB emission factors. The LLM is only provided the computed outputs to explain in plain language; it is strictly prohibited from generating numbers.
- **Consequences**: 100% auditable, unit-tested calculations that can be verified under `/docs/METHODOLOGY.md`.

---

## DEC-003: AQI Provider Architecture with In-Memory Caching & Offline Mock
- **Date**: 2026-11-20
- **Context**: Open-Meteo provides free, keyless air quality and weather forecasts, but external network requests can fail or be throttled, especially during smog episodes when thousands of users refresh simultaneously.
- **Decision**: Abstract AQI data behind `AQIProvider` interface. Use Open-Meteo as primary, cache results with a 30-minute TTL per latitude/longitude bounding box, and provide a realistic winter smog Mock Provider (Delhi, Lahore, Beijing, London, Clean baseline) for zero-key demo mode and network failures.
- **Consequences**: Zero required external API keys for demo mode, graceful degradation, and compliance with the 90+ Lighthouse mobile target.

---

## DEC-004: i18n Architecture (English & Hindi Out-of-the-Box)
- **Date**: 2026-11-20
- **Context**: Air pollution disproportionately impacts non-English-speaking communities in South Asia and globally. High-priority languages are English and Hindi, with seamless capability to add Punjabi, Bengali, Tamil, Urdu, etc.
- **Decision**: Lightweight dictionary-based translation system using JSON files (`/locales/en.json`, `/locales/hi.json`) with React Context. GenAI prompts dynamically ingest the user's active locale so plan narratives and assistant replies match the selected language.
- **Consequences**: Zero external heavy i18n bundle overhead, instantaneous language switching, extensible by simply dropping a new `<lang>.json` file.

---

## DEC-005: Safety Triage Escalation Rules
- **Date**: 2026-11-20
- **Context**: Severe smog can precipitate life-threatening medical emergencies (acute asthma exacerbation, myocardial infarction, severe hypoxia).
- **Decision**: Implement a deterministic keyword triage scanner in `/lib/safety/guardrails.ts`. Any input or condition indicating acute distress (e.g. chest tightness/pain, inability to complete a sentence, blue lips, severe wheezing) immediately halts normal AI generation and renders an unmissable red Emergency Escalation UI with emergency hotline guidance.
- **Consequences**: Clear ethical boundary that CleanBreath is an environmental coping tool, not a medical device.
