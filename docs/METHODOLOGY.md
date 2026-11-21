# CleanBreath Scientific Methodology & Impact Calculation Reference

This document details the deterministic formulas, emission factors, physiologic assumptions, and citations underpinning the **CleanBreath Impact Engine** (`/lib/impact/calculator.ts`).

---

## 1. Core Principle: Single Source of Truth
**The LLM explains numbers, but never invents them.** 
Every personal inhalation reduction percentage ($\%$) and avoided emission figure ($kg\ CO_2, g\ PM_{2.5}$) displayed on recommendation cards, community dashboards, and AI explanations is generated directly by the deterministic calculator.

---

## 2. Physiological Inhalation Exposure Model

### 2.1 The Inhalation Exposure Equation
Total particulate mass inhaled over an exposure window is computed as:
$$I = \sum_{t} C(t) \times V_{\text{activity}} \times \Delta t \times (1 - \eta_{\text{filter}})$$

Where:
- $I$: Total mass of $\text{PM}_{2.5}$ inhaled ($\mu g$).
- $C(t)$: Ambient or indoor $\text{PM}_{2.5}$ concentration ($\mu g/m^3$) at time $t$.
- $V_{\text{activity}}$: Minute ventilation rate converted to hourly volume ($m^3/h$).
- $\Delta t$: Exposure duration (hours).
- $\eta_{\text{filter}}$: Effective filtration fraction ($0.0 \le \eta \le 0.99$).

### 2.2 Minute Ventilation Rates ($V_{\text{activity}}$)
Derived from the **US EPA Exposure Factors Handbook (2011 Edition, Table 6-1)** and **ICMR Indian Anthropometric Reference Data**:

| Activity Level | Adult Male/Female Avg ($m^3/h$) | Child (6–11 yrs) ($m^3/h$) | Respiratory Equivalent ($L/\text{min}$) |
|---|---|---|---|
| **Sleep / Rest** | 0.45 | 0.32 | ~7.5 |
| **Sedentary / Desk Work** | 0.60 | 0.44 | ~10.0 |
| **Light Walk / Casual Stroll** | 0.90 | 0.68 | ~15.0 |
| **Brisk Walking / Commute Walk** | 1.50 | 1.15 | ~25.0 |
| **Heavy Exertion / Jogging / Cycling** | 2.40 | 1.80 | ~40.0+ |

*Physiologic Note*: Children breathe roughly $50\%$ more air per kilogram of body weight compared to adults, rendering them substantially more vulnerable to alveolar particulate deposition.

### 2.3 Filter Efficiencies & Penetration ($\eta_{\text{filter}}$)
Derived from **NIOSH 42 CFR Part 84**, **CDC respirator guidelines**, and published face seal leakage benchmarks:

| Mask / Filtration Type | Nominal Efficiency | Real-World Range (with seal leakage) | CleanBreath Default |
|---|---|---|---|
| **Fitted N95 / FFP2** | 95.0% | 90% – 98% | **95%** ($\eta = 0.95$) |
| **Loose N95 / Facial Hair Gap** | 70.0% | 55% – 80% | **70%** ($\eta = 0.70$) |
| **Standard Surgical Mask** | 35.0% | 20% – 50% | **35%** ($\eta = 0.35$) |
| **Single-layer Cloth Mask** | 15.0% | 8% – 25% | **15%** ($\eta = 0.15$) |
| **Operating HEPA Purifier** | 85.0% | 75% – 95% | **85%** ($\eta = 0.85$) |
| **DIY Corsi-Rosenthal Box Fan** | 80.0% | 70% – 90% | **80%** ($\eta = 0.80$) |
| **Sealed Room (Damp Towels, No Purifier)**| 35.0% | 25% – 45% | **35%** ($\eta = 0.35$) |

*Strict Safety Boundary*: Masks are **strictly prohibited** for infants under 2 years old due to suffocation risk and airway resistance hazards.

---

## 3. Avoided Emissions Model (Commute & Transportation)

Emissions avoided by shifting transportation modes are calculated as:
$$\Delta E = d \times N_{\text{trips}} \times \left(\text{EF}_{\text{baseline}} - \text{EF}_{\text{alternative}}\right)$$

### 3.1 Emission Factor Lookup Table (Urban South Asian & Global Fleet)
Synthesized from **ARAI (Automotive Research Association of India)**, **CPCB Comprehensive Vehicle Emission Inventories**, **CRRI**, and **ICCT (International Council on Clean Transportation)**:

| Transport Mode | $CO_2$ ($g/\text{km}$) | $\text{PM}_{2.5}$ ($g/\text{km}$) | $NO_x$ ($g/\text{km}$) | Metric Basis |
|---|---|---|---|---|
| **Private Petrol Car (1.2–1.5L)** | 155.0 | 0.035 | 0.22 | Tailpipe + tire/brake wear |
| **Private Diesel Car (1.5–2.0L)** | 175.0 | 0.085 | 0.58 | Tailpipe + tire/brake wear |
| **Two-Wheeler (Motorcycle/Scooter)** | 52.0 | 0.038 | 0.18 | Tailpipe + tire wear |
| **Electric Vehicle (Grid-charged)** | 45.0 | 0.006 | 0.02 | Average regional grid intensity |
| **Metro Rail (per passenger-km)** | 18.0 | 0.002 | 0.015 | DMRC/BMRCL operational averages |
| **CNG City Bus (avg 35 passengers)** | 32.0 | 0.005 | 0.12 | Per passenger-km |
| **Carpooling (2 passengers/car)** | 77.5 | 0.018 | 0.11 | Per passenger-km |
| **Walking / Cycling** | 0.0 | 0.0 | 0.0 | Zero tailpipe |

---

## 4. Indoor Air Quality & Cooking Combustion

### 4.1 Biomass vs. Clean Fuel Interventions
Derived from **WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014)** and **ICMR-Public Health Foundation of India National Burden Studies**:

- **Biomass Cookstove (Chulha / Wood / Dung)**:
  - Generates indoor $\text{PM}_{2.5}$ peak concentrations of $800 - 1,800\ \mu g/m^3$.
  - Generates toxic Carbon Monoxide ($CO$) in unvented rooms reaching $30 - 120\ \text{ppm}$.
  - Shifting to LPG or Induction cuts immediate indoor particulate peak by **88%** and eliminates acute $CO$ poisoning hazard.
- **Range Hood / Kitchen Exhaust Capture Efficiency**:
  - Mechanical capture of cooking aerosols: **65% to 85%** (Lawrence Berkeley National Laboratory, *Singer et al., 2012*).

---

## 5. Purifier Sizing & Air Changes per Hour (ACH)

The app evaluates residential room air cleaner adequacy using **ASHRAE Standard 241** and the **Association of Home Appliance Manufacturers (AHAM)**:

$$\text{ACH} = \frac{\text{CADR } (m^3/h)}{\text{Room Volume } (m^3)}$$

Where:
- $\text{Room Volume } = L \times W \times H$ (meters).
- **Target ACH**: Minimum **4.0 to 6.0 ACH** for sensitive individuals during severe winter smog episodes.
- $\text{Recommended Minimum CADR } = \text{Room Volume } \times 4.0\ m^3/h$.

---

## 6. Peer-Reviewed Citations & Data Sources
1. **US EPA** (2011). *Exposure Factors Handbook: 2011 Edition*. EPA/600/R-09/052F, Office of Research and Development, Washington, DC.
2. **World Health Organization** (2021). *WHO Global Air Quality Guidelines: Particulate matter ($PM_{2.5}$ and $PM_{10}$), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide*. Geneva.
3. **CPCB & SAFAR** (2018–2023). *System of Air Quality and Weather Forecasting And Research: High-resolution Emission Inventories and Atmospheric Dispersion Models for Megacities of India*.
4. **Ding, L. et al.** (2016). *In-cabin particulate matter exposure across transit modes and vehicle ventilation configurations*. Atmospheric Environment, 144, 212-221.
5. **Thatcher, T. L., & Layton, D. W.** (1995). *Deposition, resuspension, and penetration of particles within a residence*. Atmospheric Environment, 29(13), 1487-1497.
6. **Singer, B. C. et al.** (2012). *Pollutant concentrations and emission rates from natural gas cooking burners without and with range hood exhaust in nine California houses*. Environmental Health Perspectives, 120(4), 545-552.
