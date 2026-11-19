export type BudgetArchitecture = "repeaterless" | "repeatered";
export type PowerInputMode = "per-channel" | "total-edfa";

export type BudgetFieldName =
  | "distanceKm"
  | "attenuationDbPerKm"
  | "launchPowerPerChannelDbm"
  | "totalEdfaPowerDbm"
  | "channelCount"
  | "terminalConnectorLossDb"
  | "extraSpanLossDb"
  | "repairMarginDb"
  | "agingMarginDb"
  | "ramanRopaGainDb"
  | "repeaterSpacingKm"
  | "noiseFigureDb"
  | "targetOsnrDb";

export interface OpticalBudgetInput {
  architecture: BudgetArchitecture;
  distanceKm: number;
  attenuationDbPerKm: number;
  powerInputMode: PowerInputMode;
  launchPowerPerChannelDbm: number;
  totalEdfaPowerDbm: number;
  channelCount: number;
  terminalConnectorLossDb: number;
  extraSpanLossDb: number;
  repairMarginDb: number;
  agingMarginDb: number;
  ramanRopaGainDb: number;
  repeaterSpacingKm: number;
  noiseFigureDb: number;
  targetOsnrDb: number;
}

export interface BudgetFieldError {
  field: BudgetFieldName;
  messageId: string;
}

export interface OpticalBudgetProfilePoint {
  stepLabel: string;
  distanceKm: number;
  spanIndex: number | null;
  fiberLossDb: number;
  bolValue: number;
  eolValue: number;
  referenceValue: number;
}

export interface OpticalBudgetResult {
  valid: boolean;
  errors: readonly BudgetFieldError[];
  architecture: BudgetArchitecture;
  distanceKm: number;
  attenuationDbPerKm: number;
  effectiveLaunchPowerPerChannelDbm: number;
  fiberAttenuationDb: number;
  linearPowerFraction: number;
  linearPowerFractionLabel: string;
  displayClampedBelow1e30: boolean;
  // Repeaterless fields (null in repeatered mode)
  bolTotalLossDb: number | null;
  eolTotalLossDb: number | null;
  bolRxPowerDbm: number | null;
  eolRxPowerDbm: number | null;
  illustrativeRxThresholdDbm: number;
  eolRxMarginDb: number | null;
  // Repeatered fields (null in repeaterless mode)
  spanCount: number | null;
  spanLossDb: number | null;
  bolOsnrDb: number | null;
  eolOsnrDb: number | null;
  osnrMarginDb: number | null;
  meetsTarget: boolean;
  statusLabelId: string;
  nonlinearWarningId: string | null;
  causalExplanationId: string;
  limitationsNoteId: string;
  profileSeries: readonly OpticalBudgetProfilePoint[];
}

export interface OpticalBudgetPreset {
  id: string;
  labelId: string;
  descriptionId: string;
  input: OpticalBudgetInput;
}

export const OPTICAL_BUDGET_LIMITS = {
  distanceKm: { min: 1, max: 15000, step: 10, unit: "km", integer: false },
  attenuationDbPerKm: { min: 0.14, max: 0.35, step: 0.01, unit: "dB/km", integer: false },
  launchPowerPerChannelDbm: { min: -10, max: 10, step: 0.5, unit: "dBm", integer: false },
  totalEdfaPowerDbm: { min: 0, max: 24, step: 0.5, unit: "dBm", integer: false },
  channelCount: { min: 1, max: 120, step: 1, unit: "kanal", integer: true },
  terminalConnectorLossDb: { min: 0, max: 15, step: 0.5, unit: "dB", integer: false },
  extraSpanLossDb: { min: 0, max: 5, step: 0.1, unit: "dB", integer: false },
  repairMarginDb: { min: 0, max: 10, step: 0.5, unit: "dB", integer: false },
  agingMarginDb: { min: 0, max: 10, step: 0.5, unit: "dB", integer: false },
  ramanRopaGainDb: { min: 0, max: 30, step: 1, unit: "dB", integer: false },
  repeaterSpacingKm: { min: 40, max: 120, step: 5, unit: "km", integer: false },
  noiseFigureDb: { min: 3.5, max: 8.0, step: 0.5, unit: "dB", integer: false },
  targetOsnrDb: { min: 8.0, max: 25.0, step: 0.5, unit: "dB", integer: false },
} as const;

export const ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM = -28;
export const QUANTUM_NOISE_FLOOR_01NM_DBM = -58;

export const DEFAULT_REPEATERED_BUDGET_INPUT: OpticalBudgetInput = {
  architecture: "repeatered",
  distanceKm: 6000,
  attenuationDbPerKm: 0.17,
  powerInputMode: "per-channel",
  launchPowerPerChannelDbm: -2.0,
  totalEdfaPowerDbm: 18.0,
  channelCount: 100,
  terminalConnectorLossDb: 2.0,
  extraSpanLossDb: 0.0,
  repairMarginDb: 2.0,
  agingMarginDb: 1.5,
  ramanRopaGainDb: 0.0,
  repeaterSpacingKm: 60,
  noiseFigureDb: 5.0,
  targetOsnrDb: 14.0,
};

export const DEFAULT_REPEATERLESS_BUDGET_INPUT: OpticalBudgetInput = {
  ...DEFAULT_REPEATERED_BUDGET_INPUT,
  architecture: "repeaterless",
  distanceKm: 120,
  attenuationDbPerKm: 0.2,
  launchPowerPerChannelDbm: 0.0,
};

export const OPTICAL_BUDGET_PRESETS: readonly OpticalBudgetPreset[] = [
  {
    id: "repeatered-6000km",
    labelId: "Repeatered Lintas Samudra (6.000 km)",
    descriptionId: "100 span x 60 km, alpha 0,17 dB/km, P_ch -2 dBm, NF 5 dB (BOL vs EOL 25 thn).",
    input: { ...DEFAULT_REPEATERED_BUDGET_INPUT },
  },
  {
    id: "repeaterless-120km",
    labelId: "Repeaterless Antarpulau (120 km)",
    descriptionId: "Rute serat pasif 120 km pada 0,20 dB/km tanpa penguat aktif di dasar laut.",
    input: { ...DEFAULT_REPEATERLESS_BUDGET_INPUT },
  },
  {
    id: "repeaterless-400km-limit",
    labelId: "Batas Anggaran Daya (400 km Repeaterless)",
    descriptionId: "Menunjukkan redaman 80 dB (fraksi 1e-8) yang membutuhkan penguatan Raman/ROPA.",
    input: {
      ...DEFAULT_REPEATERLESS_BUDGET_INPUT,
      distanceKm: 400,
      attenuationDbPerKm: 0.2,
      ramanRopaGainDb: 24,
    },
  },
];

function validateField(
  value: number,
  field: BudgetFieldName,
  labelId: string,
  spec: { min: number; max: number; unit: string; integer: boolean }
): BudgetFieldError | null {
  if (!Number.isFinite(value)) {
    return {
      field,
      messageId: `${labelId} harus berupa angka valid antara ${spec.min} hingga ${spec.max} ${spec.unit}.`,
    };
  }
  if (spec.integer && !Number.isInteger(value)) {
    return {
      field,
      messageId: `${labelId} harus bilangan bulat antara ${spec.min} hingga ${spec.max} ${spec.unit}.`,
    };
  }
  if (value < spec.min || value > spec.max) {
    return {
      field,
      messageId: `${labelId} harus berada pada rentang ${spec.min} hingga ${spec.max} ${spec.unit}.`,
    };
  }
  return null;
}

export function formatLinearPowerFraction(fiberAttenuationDb: number): {
  numeric: number;
  label: string;
  clamped: boolean;
} {
  if (!Number.isFinite(fiberAttenuationDb) || fiberAttenuationDb < 0) {
    return { numeric: 0, label: "Tidak valid", clamped: false };
  }
  if (fiberAttenuationDb > 300) {
    const safeNumeric = fiberAttenuationDb > 3000 ? 0 : Math.pow(10, -fiberAttenuationDb / 10);
    return { numeric: safeNumeric, label: "< 1e-30", clamped: true };
  }
  const numeric = Math.pow(10, -fiberAttenuationDb / 10);
  if (fiberAttenuationDb >= 40) {
    return { numeric, label: numeric.toExponential(2), clamped: false };
  }
  return {
    numeric,
    label: `${(numeric * 100).toFixed(3)}% (${numeric.toExponential(2)})`,
    clamped: false,
  };
}

function sampleSteps(totalSteps: number, maxPoints = 10): number[] {
  if (totalSteps <= maxPoints) {
    return Array.from({ length: totalSteps }, (_, idx) => idx + 1);
  }
  const indices = new Set<number>([1, totalSteps]);
  const stride = (totalSteps - 1) / (maxPoints - 1);
  for (let i = 1; i < maxPoints - 1; i += 1) {
    indices.add(Math.max(1, Math.min(totalSteps, Math.round(1 + i * stride))));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export function calculateOpticalBudget(input: OpticalBudgetInput): OpticalBudgetResult {
  const errors: BudgetFieldError[] = [];

  const commonChecks: Array<BudgetFieldError | null> = [
    validateField(
      input.distanceKm,
      "distanceKm",
      "Panjang rute (L)",
      OPTICAL_BUDGET_LIMITS.distanceKm
    ),
    validateField(
      input.attenuationDbPerKm,
      "attenuationDbPerKm",
      "Koefisien redaman serat (alpha)",
      OPTICAL_BUDGET_LIMITS.attenuationDbPerKm
    ),
    validateField(
      input.repairMarginDb,
      "repairMarginDb",
      "Margin perbaikan sambungan (M_repair)",
      OPTICAL_BUDGET_LIMITS.repairMarginDb
    ),
    validateField(
      input.agingMarginDb,
      "agingMarginDb",
      "Margin penuaan sistem (M_aging)",
      OPTICAL_BUDGET_LIMITS.agingMarginDb
    ),
  ];

  if (input.powerInputMode === "per-channel") {
    commonChecks.push(
      validateField(
        input.launchPowerPerChannelDbm,
        "launchPowerPerChannelDbm",
        "Daya luncur per kanal (P_ch)",
        OPTICAL_BUDGET_LIMITS.launchPowerPerChannelDbm
      )
    );
  } else {
    commonChecks.push(
      validateField(
        input.totalEdfaPowerDbm,
        "totalEdfaPowerDbm",
        "Daya total penguat (P_total)",
        OPTICAL_BUDGET_LIMITS.totalEdfaPowerDbm
      ),
      validateField(
        input.channelCount,
        "channelCount",
        "Jumlah kanal aktif (N_lambda)",
        OPTICAL_BUDGET_LIMITS.channelCount
      )
    );
  }

  if (input.architecture === "repeaterless") {
    commonChecks.push(
      validateField(
        input.terminalConnectorLossDb,
        "terminalConnectorLossDb",
        "Rugi konektor & terminal (A_term)",
        OPTICAL_BUDGET_LIMITS.terminalConnectorLossDb
      ),
      validateField(
        input.ramanRopaGainDb,
        "ramanRopaGainDb",
        "Penguatan optik Raman / ROPA",
        OPTICAL_BUDGET_LIMITS.ramanRopaGainDb
      )
    );
  } else {
    commonChecks.push(
      validateField(
        input.repeaterSpacingKm,
        "repeaterSpacingKm",
        "Jarak antar-repeater (L_rep)",
        OPTICAL_BUDGET_LIMITS.repeaterSpacingKm
      ),
      validateField(
        input.extraSpanLossDb,
        "extraSpanLossDb",
        "Rugi sambungan ekstra per span",
        OPTICAL_BUDGET_LIMITS.extraSpanLossDb
      ),
      validateField(
        input.noiseFigureDb,
        "noiseFigureDb",
        "Noise Figure EDFA (NF)",
        OPTICAL_BUDGET_LIMITS.noiseFigureDb
      ),
      validateField(
        input.targetOsnrDb,
        "targetOsnrDb",
        "Target ilustrasi OSNR ASE",
        OPTICAL_BUDGET_LIMITS.targetOsnrDb
      )
    );
  }

  for (const err of commonChecks) {
    if (err) errors.push(err);
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      architecture: input.architecture,
      distanceKm: Number.isFinite(input.distanceKm) ? input.distanceKm : 0,
      attenuationDbPerKm: Number.isFinite(input.attenuationDbPerKm) ? input.attenuationDbPerKm : 0,
      effectiveLaunchPowerPerChannelDbm: 0,
      fiberAttenuationDb: 0,
      linearPowerFraction: 0,
      linearPowerFractionLabel: "Tidak valid",
      displayClampedBelow1e30: false,
      bolTotalLossDb: null,
      eolTotalLossDb: null,
      bolRxPowerDbm: null,
      eolRxPowerDbm: null,
      illustrativeRxThresholdDbm: ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM,
      eolRxMarginDb: null,
      spanCount: null,
      spanLossDb: null,
      bolOsnrDb: null,
      eolOsnrDb: null,
      osnrMarginDb: null,
      meetsTarget: false,
      statusLabelId: "Parameter tidak valid",
      nonlinearWarningId: null,
      causalExplanationId:
        "Terdapat parameter di luar batas fisik atau edukasional. Perbaiki kolom bertanda merah atau atur ulang parameter.",
      limitationsNoteId:
        "Model analitis tidak menerima nilai nol/negatif pada pembagi logaritma maupun input tak hingga.",
      profileSeries: [],
    };
  }

  const effectiveLaunchPowerPerChannelDbm =
    input.powerInputMode === "per-channel"
      ? input.launchPowerPerChannelDbm
      : input.totalEdfaPowerDbm - 10 * Math.log10(input.channelCount);

  const fiberAttenuationDb = input.attenuationDbPerKm * input.distanceKm;
  const fraction = formatLinearPowerFraction(fiberAttenuationDb);

  const nonlinearWarningId =
    effectiveLaunchPowerPerChannelDbm > 2.0
      ? `Catatan nonlinier: P_ch sebesar ${effectiveLaunchPowerPerChannelDbm.toFixed(2)} dBm per kanal tergolong tinggi untuk saluran DWDM rapat. Model linier ini belum mengurangi OSNR akibat derau nonlinier efek Kerr (SNR_NLI), sehingga GSNR nyata akan lebih rendah daripada estimasi di layar.`
      : null;

  if (input.architecture === "repeaterless") {
    const bolTotalLossDb = fiberAttenuationDb + input.terminalConnectorLossDb;
    const eolTotalLossDb = bolTotalLossDb + input.repairMarginDb + input.agingMarginDb;
    const bolRxPowerDbm =
      effectiveLaunchPowerPerChannelDbm - bolTotalLossDb + input.ramanRopaGainDb;
    const eolRxPowerDbm =
      effectiveLaunchPowerPerChannelDbm - eolTotalLossDb + input.ramanRopaGainDb;
    const eolRxMarginDb = eolRxPowerDbm - ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM;
    const meetsTarget = eolRxMarginDb >= 0;

    const pointCount = 8;
    const profileSeries: OpticalBudgetProfilePoint[] = Array.from(
      { length: pointCount + 1 },
      (_, idx) => {
        const d = (input.distanceKm * idx) / pointCount;
        const aFiberPoint = input.attenuationDbPerKm * d;
        const bolRx =
          effectiveLaunchPowerPerChannelDbm -
          aFiberPoint -
          input.terminalConnectorLossDb +
          input.ramanRopaGainDb;
        const eolRx = bolRx - input.repairMarginDb - input.agingMarginDb;
        return {
          stepLabel: `${Math.round(d)} km`,
          distanceKm: Number(d.toFixed(1)),
          spanIndex: null,
          fiberLossDb: aFiberPoint,
          bolValue: bolRx,
          eolValue: eolRx,
          referenceValue: ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM,
        };
      }
    );

    const statusLabelId = meetsTarget
      ? `Daya terima EOL (${eolRxPowerDbm.toFixed(2)} dBm) berada ${eolRxMarginDb.toFixed(2)} dB di atas ambang ilustrasi ${ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM} dBm`
      : `Defisit daya EOL sebesar ${Math.abs(eolRxMarginDb).toFixed(2)} dB di bawah ambang ilustrasi ${ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM} dBm`;

    return {
      valid: true,
      errors: [],
      architecture: "repeaterless",
      distanceKm: input.distanceKm,
      attenuationDbPerKm: input.attenuationDbPerKm,
      effectiveLaunchPowerPerChannelDbm,
      fiberAttenuationDb,
      linearPowerFraction: fraction.numeric,
      linearPowerFractionLabel: fraction.label,
      displayClampedBelow1e30: fraction.clamped,
      bolTotalLossDb,
      eolTotalLossDb,
      bolRxPowerDbm,
      eolRxPowerDbm,
      illustrativeRxThresholdDbm: ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM,
      eolRxMarginDb,
      spanCount: null,
      spanLossDb: null,
      bolOsnrDb: null,
      eolOsnrDb: null,
      osnrMarginDb: null,
      meetsTarget,
      statusLabelId,
      nonlinearWarningId,
      causalExplanationId: `Pada tautan repeaterless ${input.distanceKm} km dengan redaman ${input.attenuationDbPerKm.toFixed(2)} dB/km, rugi serat pasif mencapai ${fiberAttenuationDb.toFixed(2)} dB (sisa fraksi daya linier: ${fraction.label}). Jangkauan sistem tanpa pengulang ditentukan oleh total anggaran daya optik (bukan satu angka jarak kaku), sementara margin EOL menyisihkan ${input.repairMarginDb.toFixed(1)} dB untuk perbaikan masa depan dan ${input.agingMarginDb.toFixed(1)} dB untuk penuaan 25 tahun.`,
      limitationsNoteId:
        "Ambang terima -28 dBm bersifat ilustratif. Batas kepekaan penerima nyata sangat bergantung pada baud rate, skema modulasi koheren, overhead FEC, OSNR pemancar, dan profil derau penguat Raman/ROPA.",
      profileSeries,
    };
  }

  // Repeatered ASE OSNR model
  const spanCount = Math.max(1, Math.ceil(input.distanceKm / input.repeaterSpacingKm));
  const spanLossDb = input.attenuationDbPerKm * input.repeaterSpacingKm + input.extraSpanLossDb;
  const bolOsnrDb =
    -QUANTUM_NOISE_FLOOR_01NM_DBM +
    effectiveLaunchPowerPerChannelDbm -
    spanLossDb -
    input.noiseFigureDb -
    10 * Math.log10(spanCount);
  const eolOsnrDb = bolOsnrDb - input.repairMarginDb - input.agingMarginDb;
  const osnrMarginDb = eolOsnrDb - input.targetOsnrDb;
  const meetsTarget = osnrMarginDb >= 0;

  const sampledSpanIndices = sampleSteps(spanCount, 10);
  const profileSeries: OpticalBudgetProfilePoint[] = sampledSpanIndices.map((idx) => {
    const cumDistance = Math.min(input.distanceKm, idx * input.repeaterSpacingKm);
    const bolAtIdx =
      -QUANTUM_NOISE_FLOOR_01NM_DBM +
      effectiveLaunchPowerPerChannelDbm -
      spanLossDb -
      input.noiseFigureDb -
      10 * Math.log10(idx);
    const eolAtIdx = bolAtIdx - input.repairMarginDb - input.agingMarginDb;
    return {
      stepLabel: `Span ${idx}`,
      distanceKm: cumDistance,
      spanIndex: idx,
      fiberLossDb: input.attenuationDbPerKm * cumDistance,
      bolValue: bolAtIdx,
      eolValue: eolAtIdx,
      referenceValue: input.targetOsnrDb,
    };
  });

  const statusLabelId = meetsTarget
    ? `OSNR ASE EOL (${eolOsnrDb.toFixed(2)} dB) unggul +${osnrMarginDb.toFixed(2)} dB terhadap target ilustrasi ${input.targetOsnrDb.toFixed(1)} dB`
    : `OSNR ASE EOL (${eolOsnrDb.toFixed(2)} dB) kurang ${Math.abs(osnrMarginDb).toFixed(2)} dB di bawah target ilustrasi ${input.targetOsnrDb.toFixed(1)} dB`;

  return {
    valid: true,
    errors: [],
    architecture: "repeatered",
    distanceKm: input.distanceKm,
    attenuationDbPerKm: input.attenuationDbPerKm,
    effectiveLaunchPowerPerChannelDbm,
    fiberAttenuationDb,
    linearPowerFraction: fraction.numeric,
    linearPowerFractionLabel: fraction.label,
    displayClampedBelow1e30: fraction.clamped,
    bolTotalLossDb: null,
    eolTotalLossDb: null,
    bolRxPowerDbm: null,
    eolRxPowerDbm: null,
    illustrativeRxThresholdDbm: ILLUSTRATIVE_REPEATERLESS_RX_THRESHOLD_DBM,
    eolRxMarginDb: null,
    spanCount,
    spanLossDb,
    bolOsnrDb,
    eolOsnrDb,
    osnrMarginDb,
    meetsTarget,
    statusLabelId,
    nonlinearWarningId,
    causalExplanationId: `Sistem dibagi menjadi ${spanCount} span (@ ${input.repeaterSpacingKm} km dengan rugi ${spanLossDb.toFixed(2)} dB/span). Tiap penguat EDFA memulihkan daya sinyal, namun menyuntikkan derau Amplified Spontaneous Emission (ASE) secara kumulatif sebesar 10 log10(${spanCount}) = ${(10 * Math.log10(spanCount)).toFixed(2)} dB terhadap dasar derau kuantum -58 dBm per 0,1 nm. OSNR turun dari ${bolOsnrDb.toFixed(2)} dB (BOL) menjadi ${eolOsnrDb.toFixed(2)} dB (EOL).`,
    limitationsNoteId:
      "PENTING: Rumus ini hanya menghitung OSNR_ASE linier (asumsi span seragam, tanpa penyimpangan span akhir) dan BUKAN GSNR penuh (1/GSNR = 1/OSNR_ASE + 1/SNR_NLI). Menaikkan P_ch terus-menerus memicu efek nonlinier Kerr di serat yang justru menurunkan GSNR nyata, sehingga angka OSNR_ASE ini tidak dapat dipakai untuk menyatakan kelaikan modem nyata.",
    profileSeries,
  };
}
