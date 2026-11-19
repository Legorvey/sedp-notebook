export type CapacityCalculationMode = "spectral" | "channel";

export type CapacityFieldName =
  | "fiberPairs"
  | "spectrumPerPairTHz"
  | "spectralEfficiency"
  | "channelCount"
  | "channelRateGbps"
  | "channelSpacingGHz";

export interface OpticalCapacityInput {
  mode: CapacityCalculationMode;
  fiberPairs: number;
  spectrumPerPairTHz: number;
  spectralEfficiency: number;
  channelCount: number;
  channelRateGbps: number;
  channelSpacingGHz: number;
}

export interface CapacityScalingPoint {
  fiberPairs: number;
  totalFibers: number;
  perPairPerDirectionTbps: number;
  totalPerDirectionTbps: number;
  bidirectionalAggregateTbps: number;
  isSelected: boolean;
}

export interface OpticalCapacityFieldError {
  field: CapacityFieldName;
  messageId: string;
}

export interface OpticalCapacityResult {
  valid: boolean;
  errors: readonly OpticalCapacityFieldError[];
  mode: CapacityCalculationMode;
  fiberPairs: number;
  totalFibers: number;
  spectrumPerPairTHz: number;
  perPairPerDirectionTbps: number;
  totalPerDirectionTbps: number;
  bidirectionalAggregateTbps: number;
  maxSlotsPerPair: number | null;
  occupiedSpectrumGHz: number;
  spectrumOccupancyPct: number;
  effectiveBandSE: number;
  totalCapacityApproxLabel: string;
  causalSummaryId: string;
  assumptionsNoteId: string;
  idealizedVsRealNoteId: string;
  scalingSeries: readonly CapacityScalingPoint[];
}

export interface OpticalCapacityPreset {
  id: string;
  labelId: string;
  descriptionId: string;
  input: OpticalCapacityInput;
}

export const OPTICAL_CAPACITY_LIMITS = {
  fiberPairs: { min: 1, max: 48, step: 1, unit: "FP", integer: true },
  spectrumPerPairTHz: { min: 0.5, max: 10.0, step: 0.1, unit: "THz", integer: false },
  spectralEfficiency: { min: 0.5, max: 8.0, step: 0.1, unit: "bit/s/Hz", integer: false },
  channelCount: { min: 1, max: 300, step: 1, unit: "kanal", integer: true },
  channelRateGbps: { min: 10, max: 1200, step: 10, unit: "Gbps", integer: false },
  channelSpacingGHz: { min: 37.5, max: 150, step: 12.5, unit: "GHz", integer: false },
} as const;

export const DEFAULT_OPTICAL_CAPACITY_INPUT: OpticalCapacityInput = {
  mode: "spectral",
  fiberPairs: 16,
  spectrumPerPairTHz: 4.4,
  spectralEfficiency: 4.0,
  channelCount: 80,
  channelRateGbps: 100,
  channelSpacingGHz: 50,
};

export const OPTICAL_CAPACITY_PRESETS: readonly OpticalCapacityPreset[] = [
  {
    id: "c-band-modern",
    labelId: "Sistem Pita-C (16 FP, 4,4 THz)",
    descriptionId: "Contoh ilustrasi 16 pasang serat x 4,4 THz pada efisiensi 4,0 bit/s/Hz.",
    input: { ...DEFAULT_OPTICAL_CAPACITY_INPUT },
  },
  {
    id: "dwdm-channel-100g",
    labelId: "Kanal DWDM 100G (4 FP, 80 x 100G)",
    descriptionId: "Menghitung kapasitas dari jumlah kanal aktif, laju kanal, dan spasi 50 GHz.",
    input: {
      mode: "channel",
      fiberPairs: 4,
      spectrumPerPairTHz: 4.4,
      spectralEfficiency: 4.0,
      channelCount: 80,
      channelRateGbps: 100,
      channelSpacingGHz: 50,
    },
  },
  {
    id: "c-plus-l-sdm",
    labelId: "Pita C+L & Banyak FP (24 FP, 8,8 THz)",
    descriptionId: "Ilustrasi pita C+L (~8,8 THz) dengan banyak pasangan serat (SDM).",
    input: {
      mode: "spectral",
      fiberPairs: 24,
      spectrumPerPairTHz: 8.8,
      spectralEfficiency: 5.0,
      channelCount: 200,
      channelRateGbps: 200,
      channelSpacingGHz: 37.5,
    },
  },
];

function validateBoundedNumber(
  value: number,
  field: CapacityFieldName,
  labelId: string,
  spec: { min: number; max: number; unit: string; integer: boolean }
): OpticalCapacityFieldError | null {
  if (!Number.isFinite(value)) {
    return {
      field,
      messageId: `${labelId} harus berupa angka valid dalam rentang ${spec.min} hingga ${spec.max} ${spec.unit}.`,
    };
  }
  if (spec.integer && !Number.isInteger(value)) {
    return {
      field,
      messageId: `${labelId} harus berupa bilangan bulat (${spec.min} hingga ${spec.max} ${spec.unit}).`,
    };
  }
  if (value < spec.min || value > spec.max) {
    return {
      field,
      messageId: `${labelId} berada di luar batas model (${spec.min} hingga ${spec.max} ${spec.unit}).`,
    };
  }
  return null;
}

const REFERENCE_FP_STEPS = [1, 4, 8, 12, 16, 24, 32, 48] as const;

export function calculateOpticalCapacity(input: OpticalCapacityInput): OpticalCapacityResult {
  const errors: OpticalCapacityFieldError[] = [];

  const fpErr = validateBoundedNumber(
    input.fiberPairs,
    "fiberPairs",
    "Jumlah pasangan serat (N_fp)",
    OPTICAL_CAPACITY_LIMITS.fiberPairs
  );
  if (fpErr) errors.push(fpErr);

  const bwErr = validateBoundedNumber(
    input.spectrumPerPairTHz,
    "spectrumPerPairTHz",
    "Lebar spektrum per serat (B_THz)",
    OPTICAL_CAPACITY_LIMITS.spectrumPerPairTHz
  );
  if (bwErr) errors.push(bwErr);

  let maxSlotsPerPair: number | null = null;

  if (input.mode === "spectral") {
    const seErr = validateBoundedNumber(
      input.spectralEfficiency,
      "spectralEfficiency",
      "Efisiensi spektral (SE)",
      OPTICAL_CAPACITY_LIMITS.spectralEfficiency
    );
    if (seErr) errors.push(seErr);
  } else {
    const chCountErr = validateBoundedNumber(
      input.channelCount,
      "channelCount",
      "Jumlah kanal (N_lambda)",
      OPTICAL_CAPACITY_LIMITS.channelCount
    );
    if (chCountErr) errors.push(chCountErr);

    const chRateErr = validateBoundedNumber(
      input.channelRateGbps,
      "channelRateGbps",
      "Laju per kanal (R_lambda)",
      OPTICAL_CAPACITY_LIMITS.channelRateGbps
    );
    if (chRateErr) errors.push(chRateErr);

    const spacingErr = validateBoundedNumber(
      input.channelSpacingGHz,
      "channelSpacingGHz",
      "Spasi antar-kanal (Delta_f)",
      OPTICAL_CAPACITY_LIMITS.channelSpacingGHz
    );
    if (spacingErr) errors.push(spacingErr);

    if (!bwErr && !spacingErr) {
      // Tiny epsilon prevents floating-point rounding loss at exact grid multiples (e.g. 4.4*1000/50 = 88).
      maxSlotsPerPair = Math.floor(
        (input.spectrumPerPairTHz * 1000 + 1e-9) / input.channelSpacingGHz
      );
      if (!chCountErr && input.channelCount > maxSlotsPerPair) {
        errors.push({
          field: "channelCount",
          messageId: `Maksimum ${maxSlotsPerPair} kanal pada spektrum ${input.spectrumPerPairTHz} THz dengan spasi ${input.channelSpacingGHz} GHz.`,
        });
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      mode: input.mode,
      fiberPairs: Number.isFinite(input.fiberPairs) ? input.fiberPairs : 0,
      totalFibers: 0,
      spectrumPerPairTHz: Number.isFinite(input.spectrumPerPairTHz) ? input.spectrumPerPairTHz : 0,
      perPairPerDirectionTbps: 0,
      totalPerDirectionTbps: 0,
      bidirectionalAggregateTbps: 0,
      maxSlotsPerPair,
      occupiedSpectrumGHz: 0,
      spectrumOccupancyPct: 0,
      effectiveBandSE: 0,
      totalCapacityApproxLabel: "Parameter tidak valid",
      causalSummaryId:
        "Perbaiki parameter yang berada di luar rentang fisik agar kapasitas dapat dihitung.",
      assumptionsNoteId:
        "Asumsi pasangan serat seragam (1 FP = 2 serat searah berlawanan) dan laju payload bersih pasca-FEC (konvensi SI desimal 1 Tbps = 1000 Gbps).",
      idealizedVsRealNoteId:
        "Model linier ideal tidak menghitung penurunan OSNR/GSNR akibat panjang rute atau pembagian daya pompa repeater antar-pasangan serat (SDM).",
      scalingSeries: [],
    };
  }

  const totalSpectrumGHz = input.spectrumPerPairTHz * 1000;
  let perPairPerDirectionTbps = 0;
  let occupiedSpectrumGHz = totalSpectrumGHz;
  let effectiveBandSE = input.spectralEfficiency;

  if (input.mode === "spectral") {
    perPairPerDirectionTbps = input.spectrumPerPairTHz * input.spectralEfficiency;
  } else {
    perPairPerDirectionTbps = (input.channelCount * input.channelRateGbps) / 1000;
    occupiedSpectrumGHz = input.channelCount * input.channelSpacingGHz;
    effectiveBandSE = (input.channelCount * input.channelRateGbps) / totalSpectrumGHz;
  }

  const totalPerDirectionTbps = input.fiberPairs * perPairPerDirectionTbps;
  const bidirectionalAggregateTbps = 2 * totalPerDirectionTbps;
  const totalFiberCount = 2 * input.fiberPairs;
  const spectrumOccupancyPct = Math.min(100, (occupiedSpectrumGHz / totalSpectrumGHz) * 100);

  const fpSet = new Set<number>(REFERENCE_FP_STEPS);
  fpSet.add(input.fiberPairs);
  const sortedFp = Array.from(fpSet).sort((a, b) => a - b);

  const scalingSeries: CapacityScalingPoint[] = sortedFp.map((fp) => {
    const dirTotal = fp * perPairPerDirectionTbps;
    return {
      fiberPairs: fp,
      totalFibers: fp * 2,
      perPairPerDirectionTbps,
      totalPerDirectionTbps: dirTotal,
      bidirectionalAggregateTbps: 2 * dirTotal,
      isSelected: fp === input.fiberPairs,
    };
  });

  const bandNote =
    input.spectrumPerPairTHz >= 7.5
      ? "spektrum pita lebar C+L"
      : input.spectrumPerPairTHz >= 4.0
        ? "kisaran pita-C modern (~4,4 THz)"
        : "porsi spektrum terbatasi atau sewa spektrum sebagian";

  const channelOver8Note =
    input.mode === "channel" && effectiveBandSE > 8.0
      ? " Catatan: efisiensi rata-rata di atas 8 bit/s/Hz melampaui batas praktik modulasi koheren komersial pada lebar spektrum ini."
      : "";

  const causalSummaryId =
    input.mode === "spectral"
      ? `Setiap 1 pasangan serat (${perPairPerDirectionTbps.toFixed(2)} Tbps searah) bekerja dua arah penuh lewat 2 serat terpisah (Tx dan Rx). Mengalikan dengan ${input.fiberPairs} FP (${totalFiberCount} serat total) pada ${bandNote} menghasilkan ${totalPerDirectionTbps.toFixed(2)} Tbps per arah atau ${bidirectionalAggregateTbps.toFixed(2)} Tbps agregat dua arah.`
      : `Sebanyak ${input.channelCount} kanal berjarak ${input.channelSpacingGHz} GHz mengisi ${occupiedSpectrumGHz.toFixed(1)} GHz dari total ${totalSpectrumGHz.toFixed(0)} GHz (${spectrumOccupancyPct.toFixed(1)}% okupansi pita, batas ${maxSlotsPerPair} slot). Efisiensi rata-rata pita efektifnya ${effectiveBandSE.toFixed(3)} bit/s/Hz per arah.${channelOver8Note}`;

  const approxDirLabel =
    totalPerDirectionTbps < 1
      ? totalPerDirectionTbps.toFixed(2)
      : String(Math.round(totalPerDirectionTbps));
  const approxBiLabel =
    bidirectionalAggregateTbps < 1
      ? bidirectionalAggregateTbps.toFixed(2)
      : String(Math.round(bidirectionalAggregateTbps));

  return {
    valid: true,
    errors: [],
    mode: input.mode,
    fiberPairs: input.fiberPairs,
    totalFibers: totalFiberCount,
    spectrumPerPairTHz: input.spectrumPerPairTHz,
    perPairPerDirectionTbps,
    totalPerDirectionTbps,
    bidirectionalAggregateTbps,
    maxSlotsPerPair,
    occupiedSpectrumGHz,
    spectrumOccupancyPct,
    effectiveBandSE,
    totalCapacityApproxLabel: `~${approxDirLabel} Tbps searah, ~${approxBiLabel} Tbps agregat 2 arah`,
    causalSummaryId,
    assumptionsNoteId:
      "Asumsi pasangan serat seragam (1 FP = 2 serat berlawanan arah Tx/Rx), konvensi SI desimal 1 Tbps = 1000 Gbps, serta laju informasi bersih pasca-FEC.",
    idealizedVsRealNoteId:
      "Keluaran ini adalah kapasitas desain ideal. Pada kabel nyata, pencapaian efisiensi spektral sangat bergantung pada OSNR/GSNR sepanjang bentang laut, jumlah repeater, efek nonlinier serat, dan pembagian daya pompa optik pada sistem banyak serat (SDM).",
    scalingSeries,
  };
}
