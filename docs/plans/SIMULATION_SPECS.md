# Subsea Engineering Simulation Specifications: SEDP Learning Hub

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Engineering Grounding:** Verified equations, constants, and worked problems from `Module 1.3`, `Modul 1.2`, and `Modul_1.1`, paired with explicit educational approximation boundaries.

---

## 1. Universal Modeling Disclaimer & Accessibility Contract

### Mandatory Disclaimer (Rendered on Every `.abyss-bay` Lab & `/referensi/rumus`) `[VERIFIED: Subsea Review]`

> **Penafian Pemodelan Edukatif (Educational Approximation Disclaimer):**  
> Simulator ini memakai model analitis yang disederhanakan (rugi span seragam, drop tegangan repeater konstan, estimasi ASE/OSNR linier tanpa simulasi penuh efek nonlinier Kerr, resistansi gangguan shunt ideal, dan kelonggaran serat nominal) **khusus untuk memahami intuisi konsep**. Hasil perhitungan **bukan alat rekayasa produksi** dan tidak boleh digunakan untuk desain komersial, operasi tegangan tinggi PFE, penentuan koordinat kapal perbaikan, atau perizinan rute kelautan.

### Universal Simulator Accessibility & UI Rules (`R-03`, `R-27`, `R-32`, `R-39`) `[PROPOSED]`

1. **No Drag-Only Controls (`WCAG 2.5.7`):** Every slider (`<input type="range">`) pairs with `<label for>`, direct numeric input, and `-` / `+` step buttons (`>= 44x44px`).
2. **Tabular Fallback Parity:** Every chart (`Recharts`) or interactive schematic (`SVG`) renders a synchronized, semantic HTML `<table>` (`<caption>`, `<th scope>`, units in `IBM Plex Mono`) so screen-reader and keyboard users inspect identical computed rows.
3. **Explicit Validation & States (`R-27`):** Out-of-range, `0`, negative, `NaN`, or physically contradictory parameters return inline Indonesian alerts (`role="alert"`, `aria-invalid="true"`, paired icon + text) with a one-click _"Atur Ulang Parameter"_ recovery button. Never propagate `NaN` or `Infinity` to DOM or SVG attributes.
4. **Reduced Motion (`MOTION 1`, `R-39`):** Signal sweep animations play only on explicit user trigger (`"Simulasikan Sinyal"`) and snap cleanly to deterministic static states under `prefers-reduced-motion: reduce`.

---

## 2. Priority V1 Simulators (Shipped in V1)

### Lab (a): Optical Capacity Calculator (`/lab/kapasitas-optik`)

- **Goal:** Teach how total submarine cable capacity decomposes into wet-plant design (`N_fp`, usable C-band spectrum `B_THz`) and dry-plant SLTE modulation efficiency (`SE` or `N_lambda x R_lambda`).
- **Inputs & Validation Ranges:**
  - `mode`: `"spectral" | "channel"`
  - `fiberPairs` (`N_fp`, integer `1..48`, default `16`)
  - `spectrumPerPairTHz` (`B_THz`, `0.5..10.0 THz`, default `4.4`, preset C-band `~4.4 THz` / C+L `~8.8 THz` clearly labeled)
  - `spectralEfficiency` (`SE`, `0.5..8.0 bit/s/Hz`, default `4.0` in spectral mode)
  - `channelCount` (`N_lambda`, integer `1..200`, default `80`), `channelRateGbps` (`R_lambda`, `10..1200 Gbps`, default `100`), `channelSpacingGHz` (`Delta_f`, `37.5..150 GHz`, default `50`) in channel mode.
- **Equations (Decimal SI Telecom Convention: `1 Tbps = 1000 Gbps`):**
  - Spectral mode: `pairCapacityTbps = B_THz * SE`; `totalCapacityTbps = N_fp * pairCapacityTbps`.
  - Channel mode: `maxSlots = floor((B_THz * 1000) / Delta_f)`. Reject/warn if `N_lambda > maxSlots`. `pairCapacityTbps = (N_lambda * R_lambda) / 1000`; `totalCapacityTbps = N_fp * pairCapacityTbps`; `effectiveSE = (N_lambda * R_lambda) / (B_THz * 1000)`.
- **Assumptions:** Uniform fiber pairs, net post-FEC payload rate, independent `N_fp` and `SE` (notes SDM pump-power sharing trade-off qualitatively per `M1.3 p.17/68`).
- **Test Vectors & Edge Cases:**
  - Vector 1 (`M1.3 p.60`): `N_fp=16, B_THz=4.4, SE=4.0` -> `17.600 Tbps/fp`, `281.600 Tbps` total (`~280 Tbps`).
  - Vector 2 (`M1.2 p.10` IGG): `N_fp=4, N_lambda=80, R_lambda=100, B_THz=4.4, Delta_f=50` -> `8.000 Tbps/fp`, `32.000 Tbps`, `effectiveSE = 1.818 bit/s/Hz`, `maxSlots = 88`.
  - Edge case: `N_lambda = 90` at `4.4 THz / 50 GHz` -> triggers spectral overflow error (`"Maksimum 88 kanal pada spektrum 4.4 THz dengan spasi 50 GHz"`).

#### Concrete Simulator I/O Example (Lab a)

```json
{
  "input": {
    "mode": "spectral",
    "fiberPairs": 16,
    "spectrumPerPairTHz": 4.4,
    "spectralEfficiency": 4.0
  },
  "output": {
    "valid": true,
    "perPairTbps": 17.6,
    "totalCapacityTbps": 281.6,
    "totalCapacityApproxLabel": "~282 Tbps",
    "assumptionsNoteId": "Asumsi pasangan serat seragam dan efisiensi spektral bersih pasca-FEC pada pita-C (~4.4 THz)."
  }
}
```

### Lab (b): Attenuation & Optical Power Budget (`/lab/anggaran-daya`)

- **Goal:** Demonstrate exponential power loss in unrepeatered fiber versus ASE OSNR accumulation across EDFA spans in repeatered systems (`M1.3 p.16, 27-29, 42, 61`), plus 25-year system margins.
- **Inputs & Validation Ranges:**
  - `architecture`: `"repeaterless" | "repeatered"`
  - `distanceKm` (`L`, `1..15000 km`; repeaterless default `120`, repeatered default `6000`)
  - `attenuationDbPerKm` (`alpha`, `0.14..0.35 dB/km`; default `0.17` C-band / `0.20` worked preset)
  - `powerInputMode`: `"per-channel" | "total-edfa"`; either `launchPowerPerChannelDbm` (`P_ch`, `-10..+10 dBm`, default `-2`) or derived `P_ch = totalEdfaPowerDbm - 10*log10(channelCount)` with `totalEdfaPowerDbm` (`0..+24 dBm`, default `18`) and `channelCount` (`N_lambda`, `1..120`, default `100`)
  - `spliceConnectorLossDb` (`0..15 dB`, default `2.0`; applied end-to-end in repeaterless mode or as span-level passive allowance when testing custom repeaterless/span sensitivity), `repairMarginDb` (`0..10 dB`, default `2.0`), `agingMarginDb` (`0..10 dB`, default `1.5`), `ramanRopaGainDb` (`0..30 dB`, repeaterless only, default `0`)
  - Repeatered-only: `repeaterSpacingKm` (`L_rep`, `40..120 km`, default `60`), `noiseFigureDb` (`NF`, `3.5..8.0 dB`, default `5.0`), `targetOsnrDb` (`8.0..25.0 dB`, default `14.0`).
- **Equations:**
  - `A_fiber = alpha * L`; linear power fraction `10 ** (-A_fiber / 10)` (guarded against `< 1e-300` display underflow past ~3,000 dB).
  - **Repeaterless mode:** `totalLossDb = A_fiber + A_splice + M_repair + M_aging`; `rxPowerDbm = P_ch - totalLossDb + G_ramanRopa`. Compare against receiver sensitivity (`-28 dBm` illustrative).
  - **Repeatered mode:** `N_spans = ceil(L / L_rep)`; `L_span = alpha * L_rep`; linear ASE accumulation in `0.1 nm` (`~12.5 GHz`) reference bandwidth (`-58 dBm` quantum floor):
    `BOL_OSNR_dB = 58 + P_ch - L_span - NF - 10 * log10(N_spans)`.
    `EOL_OSNR_dB = BOL_OSNR_dB - M_repair - M_aging`.
- **Assumptions:** Linear ASE-only approximation (explicitly warns that raising `P_ch` endlessly triggers Kerr NLI in real wet plants, not captured in linear ASE mode); bounded Raman/ROPA gain (`<= 30 dB`).
- **Test Vectors & Edge Cases:**
  - Vector 1 (`M1.3 p.28`): `alpha=0.20`, `L = 100, 400, 5000 km` -> `A_fiber = 20.00 dB (1.000%)`, `80.00 dB (1.0e-8)`, `1000.00 dB (underflow safe: "< 1e-30")`.
  - Vector 2 (`Repeatered`): `L=6000 km`, `L_rep=60 km (N_spans=100)`, `alpha=0.17 (L_span=10.2 dB)`, `P_ch=-2 dBm`, `NF=5 dB`, `M_repair=2.0 dB`, `M_aging=1.5 dB` -> `BOL_OSNR = 58 - 2 - 10.2 - 5 - 20 = 20.80 dB`, `EOL_OSNR = 17.30 dB`.
  - Edge case: `channelCount <= 0` or `L_rep <= 0` blocked cleanly; `Recharts` budget/OSNR curve pairs 1:1 with tabular span breakdown.

### Lab (c): End-to-End System Explorer (`/lab/eksplorer-sistem`) _(Part of Vertical Slice `1.3-01`)_

- **Goal:** Interactive visual inspection of dry plant, landing transition, and wet plant blocks (`PoP`, `Backhaul`, `CLS [SLTE, CTB, PFE, LME/NMS]`, `BMH`, `Armoured Shore End`, `Repeater`, `Equalizer`, `Branching Unit`, `ROPA`), contrasting **Repeatered (Turnkey vs Open Cable G.977.1)** and **Repeaterless**.
- **Inputs:** System mode toggle (`"repeatered" | "repeatered-open" | "repeaterless-edfa" | "repeaterless-ropa"`), illustrative educational seabed-armour preset selector (`"pesisir-dangkal-buried"` vs `"transisi-paparan-kontinental"` vs `"laut-dalam-stabil"`, labeled explicitly as _"preset ilustratif kualitatif untuk membandingkan risiko jangkar/abrasi dan kebutuhan double/single/lightweight armour, bukan batas kedalaman universal atau spesifikasi merek vendor"_), active node selection (`pop`, `cls`, `slte`, `pfe`, `bmh`, `shore`, `repeater`, `bu`, `ropa`).
- **Outputs:** Highlighted optical path vs DC power/sea-earth return path (shows power path absent in repeaterless mode), node inspector card (role, physical location, repair turnaround hours vs weeks, design life, glossary links), and accessible summary table.
- **Accessibility:** Custom React `<svg>` with `<title>`/`<desc>` + keyboard-focusable node `<button>` elements + vertical mobile node stepper (`< 600px`). Zero hover-only tooltips (`R-03`, `R-32`).

### Lab (d): Route Fault & Redundancy Simulator (`/lab/gangguan-redundansi`)

- **Goal:** Compare **Point-to-Point**, **Festoon**, **Trunk & Branch (PSBU)**, and **Ring / Mesh** resilience under single/multi-segment faults, contrasting automatic **Protection (`< 50 ms`)** vs **Restoration (seconds-minutes)** (`M1.3 p.18, 31, 62-64`), plus fiber latency vs GEO/LEO (`M1.2 p.14`).
- **Inputs:** `topology` (`"point-to-point" | "festoon" | "trunk-branch" | "ring-mesh"`), `faultSegmentId`, `mitigationMode` (`"none" | "protection" | "restoration"`), `routeLengthKm` (`100..20000 km`).
- **Outputs:** Surviving traffic share (`0%` vs `100%` protected vs degraded/restored capacity), estimated switchover window, optical one-way propagation delay (`routeLengthKm * 4.90 ms / 1000` at `204,000 km/s`, alongside `~5 ms/1000 km` rule-of-thumb and GEO `~240 ms` one-way reference), and fault-cause context grounded exclusively in cleared public `ICPC` releases (`src-icpc-best-practices`: `86%` penangkapan ikan/jangkar secara global `2010-2024`, biaya perbaikan tipikal `>US$1 juta`, durasi perbaikan `>= 2 minggu` hingga `>3 bulan` bila terhambat izin).
- **Assumptions:** Abstract schematic graph (does not simulate BGP/OTN control planes or commercial map geometry).

### Lab (e): Interactive Historical Timeline (`/lab/linimasa-sejarah`)

- **Goal:** Explore subsea capacity scaling across 170+ years (`Telegraf 1850-1950` -> `Koaksial & Satelit 1956-1988` -> `Serat Optik, EDFA, WDM, Koheren, SDM 1988-2025+`) (`M1.1 p.6-37`, `M1.2 p.12`).
- **Inputs:** Era filter chips (`Semua`, `Telegraf`, `Koaksial & Satelit`, `Serat Optik & SDM`), Indonesia-spotlight toggle, milestone stepper / log-scale capacity chart toggle.
- **Outputs:** Milestone card (`words/min`, `voice channels`, `Mbps`, `Tbps` clearly typed without mixing units silently), Nusantara/Indonesia links (`1871 Jawa-Darwin`, `1976 Palapa A1`, `2000 SEA-ME-WE 3`, `2017 SEA-US`, `2019 Palapa Ring ~12,000-12,200 km`, `2022 Echo`, `2025 Bifrost RFS`), and explicit source + verification flags on recent entries (`fc-tat8-rate`, `fc-palapa-ring`).

---

## 3. Priority V1.1 Simulators (Post-V1 Vertical Slice Rollout)

### Lab (f): PFE Polarity, Voltage Profile & Shunt Fault Locator (`/lab/lokalisasi-pfe`)

- **Goal:** Teach opposite-polarity constant-current DC series powering (`±V/2`, zero-volt mid-point, single-end fallback) and electrical shunt fault localization (`M1.3 p.46-50`).
- **Inputs:** `systemLengthKm` (`100..12000`, default `1200`), `repeaterSpacingKm` (`40..120`, default `60`), `currentAmp` (`0.5..2.0 A`, default `1.0`), `conductorResistanceOhmPerKm` (`0.6..1.6 ohm/km`, default `1.0`), `repeaterDropV` (`10..40 V`, default `20`), `pfeOutResOhm` (`0..100 ohm`, default `30`), `earthDropV` (`0..50 V`, default `10`), `mode`: `"normal-profile" | "single-ended-shunt" | "double-ended-shunt"`, measured `V_A` (default `630 V`) and `V_B` (for double-ended).
- **Equations:**
  - Normal split feed: `N_rep = floor((L - 1e-6) / L_rep)`; `V_total = I*(2*R_out + r*L) + 2*V_earth + N_rep*V_rep`; `V_A = +V_total/2`, `V_B = -V_total/2` (warn if `|V_PFE| > 12,000 V` batas kehati-hatian tegangan PFE tipikal laut dalam).
  - Single-ended zero-`R_f` solver (`M1.3 p.50`): Normalize station test voltage magnitude (`V_testA = abs(V_A)`); `V_lineA = V_testA - I*R_out - V_earth`. Scan repeater span index `n = 0..N_rep`: `d = (V_lineA - n*V_rep) / (I*r)`. Accept unique `n` satisfying `(n < N_rep ? (n*L_rep <= d && d < (n+1)*L_rep) : (n*L_rep <= d && d <= L))`.
  - Double-ended unknown-`R_f` solver: Normalize both station magnitudes (`abs(V_A) > 0`, `abs(V_B) > 0`) under equal test current `I`, computing `V_lineA = abs(V_A) - I*R_out - V_earth` and `V_lineB = abs(V_B) - I*R_out - V_earth`; search valid `n_A` (`n_B = N_rep - n_A`) where `d = [L + (V_lineA - V_lineB - (n_A - n_B)*V_rep) / (I*r)] / 2` satisfies `(n_A < N_rep ? (n_A*L_rep <= d && d < (n_A+1)*L_rep) : (n_A*L_rep <= d && d <= L))` and `R_f = (V_lineA + V_lineB - I*r*L - N_rep*V_rep)/(2*I) >= 0`.
- **Mandatory Edge Cases & Test Vectors:**
  - Vector 1 (`M1.3 p.50`): `V_A=630, R_out=30, V_earth=10, I=1, r=1.0, V_rep=20, L_rep=60` -> `V_line=590`, unique `n=7`, **`d=450.0 km`** (`30 km` past R7 at `420 km`).
  - Vector 2 (Staircase Dead Zone): `V_lineA=550 V` sits inside R7's `20 V` step (`[540, 560) V`); solver returns explicit Indonesian diagnostic (`"Tegangan jatuh pada zona langkah Repeater R7: gangguan di dalam repeater atau shunt pada span sebelumnya dengan R_f > 0"`).
  - Vector 3 (Double-Ended `R_f > 0`): `L=1200, L_rep=60 (N_rep=19), R_f=25 ohm, true d=450 km` -> `V_A=655 V`, `V_B=1055 V` -> naive single-ended errs by `+25 km` (`475 km`), while double-ended recovers `d=450.0 km` and `R_f=25.0 ohm`.

### Lab (g): Coherent Modulation & Shannon Reach-vs-OSNR (`/lab/modulasi-koheren`)

- **Goal:** Compare `PDM-QPSK` (`2 b/sym`), `PDM-16QAM` (`4 b/sym`), and `PDM-64QAM` (`6 b/sym`) against dual-polarization Shannon capacity (`M1.3 p.44-45`).
- **Inputs:** `symbolRateGbaud` (`32..140 GBaud`, default `64`), `osnr01nmDb` (`-5..35 dB`, default `15.0`), `fecOverheadPct` (`10..35%`, default `28%`, matching code rate `1 / 1.28 = 0.781`).
- **Equations:**
  - Net rate per format: `R_net = (2 * b_sym * R_s) / (1 + fecOverhead)` (at `R_s = 64 GBaud` and `fecOverhead = 0.28`: `200.0G / 400.0G / 600.0G` exact).
  - In-band SNR scaling (CRITICAL): `SNR_dB = OSNR_0.1nm + 10*log10(12.5 / R_s)`, `SNR_lin = 10 ** (SNR_dB / 10)`.
  - Dual-pol Shannon ceiling: `C_DP = 2 * R_s * log2(1 + SNR_lin)` (also displays single-pol `C_1pol = R_s * log2(1 + SNR_lin)` to reconcile `M1.3 p.45` formula).
- **Test Vector:** `R_s=64`, `OSNR_0.1nm=15.0 dB` -> `SNR_dB=7.91 dB` (`6.176 lin`) -> `C_DP=363.94 Gbps` (QPSK `200G` viable; `16QAM 400G` & `64QAM 600G` flagged _"Melebihi Batas Teoretis Shannon"_). Explicitly notes real reach also depends on GSNR (`OSNR_ASE` + Kerr `SNR_NLI`).

### Lab (h): Spectrum Flex-Grid WSS & ASE Dummy Light (`/lab/spektrum-ase`)

- **Goal:** Illustrate open-cable spectrum sharing across tenants (`4.4 THz` C-band, `50 GHz` fixed vs `12.5 GHz` flex slots) and why ASE dummy loading prevents channel power overshoot (`M1.3 p.43, 67`).
- **Equations:** `overshootDb = 10 * log10(B_tot / B_live)` when dummy light is OFF (`B_live > 0`), `0.00 dB` when dummy light is ON. At `10%` live fill (`0.44 / 4.4 THz`), overshoot is `+10.00 dB` (10x PSD). Handles `0%` live fill cleanly (`100% ASE loading`, zero division-by-zero). Flat-PSD educational model (excludes SRS tilt).

### Lab (i): COTDR Echo Timeline & Break Localization (`/lab/jejak-cotdr`)

- **Goal:** Teach coherent repeater-loopback sawtooth traces, `d_opt = v * t_RT / 2` (`v = 204,000 km/s`, `1 ms <-> 102 km`), and mandatory Step 3 RPL slack correction `d_cable = d_opt / (1 + s_slack)` (`M1.3 p.54-55`).
- **Test Vector:** `t_RT=2.100 ms`, `s_slack=0.02 (2% EFL)` -> `d_opt=214.20 km`, `d_cable=210.00 km`. Generates synthetic sawtooth trace ending after the last healthy repeater before the break.

### Lab (j): Marine Survey Instrument Explorer (`/lab/survei-kelautan`) _(Gated on M1.5)_

- **Status:** **`[BLOCKED / PENDING M1.5 SOURCE]`** because `Catatan SEDP-1.pdf` and official Module `1.5` slides are missing on disk.
- **Two-Tier Plan:**
  - _Tier 1 (Qualitative Concept Explorer):_ Only publishable if owner approves external public-standard sourcing (IHO S-44 / ICPC) ahead of M1.5 arrival; maps `SBES`, `MBES`, `SSS`, `SBP`, `USBL`, `Magnetometer`, and `Gravity Corer` to measurement targets and verified `DA/SA/LWP/LW` + `1-3 m` burial outputs (`M1.3 p.25`, `Kepmen KP 14/2021`).
  - _Tier 2 (Quantitative Geometry):_ Strictly deferred until `Catatan SEDP-1.pdf` / M1.5 slides are audited in `sources-private/`. Zero dead links (`R-24`) before readiness.
