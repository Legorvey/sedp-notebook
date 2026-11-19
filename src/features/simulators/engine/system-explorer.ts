export type SystemExplorerMode =
  "repeatered" | "repeatered-open" | "repeaterless-edfa" | "repeaterless-ropa";

export type ArmourPresetId =
  "pesisir-dangkal-buried" | "transisi-paparan-kontinental" | "laut-dalam-stabil";

export type ExplorerNodeId =
  "pop" | "cls" | "slte" | "pfe" | "bmh" | "shore" | "repeater" | "bu" | "ropa";

export interface SystemModeSpec {
  id: SystemExplorerMode;
  labelId: string;
  shortLabelId: string;
  standardRef: string;
  dcPfeActive: boolean;
  seaEarthActive: boolean;
  openCableDisaggregated: boolean;
  wetAmplificationLabelId: string;
  summaryId: string;
  activeNodeIds: readonly ExplorerNodeId[];
}

export interface ArmourPresetSpec {
  id: ArmourPresetId;
  labelId: string;
  armourClassId: string;
  hazardContextId: string;
  burialNoteId: string;
}

export interface ExplorerNodeSpec {
  id: ExplorerNodeId;
  abbr: string;
  labelId: string;
  zone: "dry-plant" | "transisi" | "wet-plant";
  zoneLabelId: string;
  locationId: string;
  roleId: string;
  opticalPathDetailId: string;
  electricalPathDetailId: string;
  repairTurnaroundId: string;
  designContextId: string;
  subsystemsNoteId?: string;
  glossaryId?: string;
}

export interface ExplorerTableRow {
  nodeId: ExplorerNodeId;
  abbr: string;
  componentLabelId: string;
  zoneLabelId: string;
  isActiveInMode: boolean;
  statusLabelId: string;
  opticalFunctionId: string;
  electricalFunctionId: string;
  repairTurnaroundId: string;
}

export const EDUCATIONAL_MODEL_DISCLAIMER_ID =
  "Simulator ini memakai model arsitektur dan analitis yang disederhanakan khusus untuk memahami intuisi konsep. Hasil tampilan bukan alat rekayasa produksi dan tidak boleh digunakan untuk desain komersial, operasi tegangan tinggi PFE, penentuan koordinat kapal perbaikan, atau perizinan rute kelautan.";

export const ARMOUR_PRESET_CAVEAT_ID =
  "Preset ilustratif kualitatif untuk membandingkan risiko jangkar atau abrasi dan kebutuhan pelindung double, single, atau lightweight, bukan batas kedalaman universal maupun spesifikasi merek vendor.";

export const SYSTEM_MODES: readonly SystemModeSpec[] = [
  {
    id: "repeatered",
    labelId: "Repeatered (Turnkey Terpadu)",
    shortLabelId: "Repeatered",
    standardRef: "ITU-T G.977",
    dcPfeActive: true,
    seaEarthActive: true,
    openCableDisaggregated: false,
    wetAmplificationLabelId: "Repeater EDFA aktif di dasar laut dicatu DC oleh PFE",
    summaryId:
      "Sistem jarak jauh dengan repeater EDFA aktif di dasar laut yang dicatu arus searah konstan dari PFE melalui konduktor tembaga kabel dan elektrode tanah laut, umumnya dipasok sebagai satu kesatuan sistem.",
    activeNodeIds: ["pop", "cls", "slte", "pfe", "bmh", "shore", "repeater", "bu"],
  },
  {
    id: "repeatered-open",
    labelId: "Repeatered Open Cable (G.977.1)",
    shortLabelId: "Open Cable",
    standardRef: "ITU-T G.977.1",
    dcPfeActive: true,
    seaEarthActive: true,
    openCableDisaggregated: true,
    wetAmplificationLabelId: "Repeater EDFA wet plant terpisah secara antarmuka dari SLTE",
    summaryId:
      "Arsitektur Open Cable memisahkan wet plant (kabel, repeater EDFA, BU, dan pencatuan PFE) dari perangkat terminal SLTE multi-vendor di CLS agar transponder koheren dapat dimutakhirkan secara independen.",
    activeNodeIds: ["pop", "cls", "slte", "pfe", "bmh", "shore", "repeater", "bu"],
  },
  {
    id: "repeaterless-edfa",
    labelId: "Repeaterless (EDFA Terminal)",
    shortLabelId: "Repeaterless EDFA",
    standardRef: "ITU-T G.973",
    dcPfeActive: false,
    seaEarthActive: false,
    openCableDisaggregated: false,
    wetAmplificationLabelId: "Tanpa penguat di laut; penguatan optik berada di CLS darat",
    summaryId:
      "Seluruh bentang laut hanya berisi serat optik pasif tanpa repeater bertenaga listrik. Jangkauan ditentukan oleh anggaran daya optik total dari pemancar dan penguat terminal di CLS.",
    activeNodeIds: ["pop", "cls", "slte", "bmh", "shore"],
  },
  {
    id: "repeaterless-ropa",
    labelId: "Repeaterless + ROPA Basah (Tanpa PFE)",
    shortLabelId: "Repeaterless ROPA",
    standardRef: "ITU-T G.973",
    dcPfeActive: false,
    seaEarthActive: false,
    openCableDisaggregated: false,
    wetAmplificationLabelId: "Modul ROPA pasif di laut dipompa cahaya laser dari darat",
    summaryId:
      "Memperpanjang jangkauan tautan repeaterless dengan menempatkan modul serat erbium (ROPA) di dasar laut yang energinya dikirim lewat cahaya laser pompa dari CLS, tetap tanpa jalur daya listrik DC PFE.",
    activeNodeIds: ["pop", "cls", "slte", "bmh", "shore", "ropa"],
  },
];

export const ARMOUR_PRESETS: readonly ArmourPresetSpec[] = [
  {
    id: "pesisir-dangkal-buried",
    labelId: "Pesisir Dangkal & Alur Jangkar",
    armourClassId: "Double Armour (DA)",
    hazardContextId: "Risiko tinggi dari jangkar kapal, pukat dasar, dan arus pantai",
    burialNoteId: "Umumnya ditanam (buried) di bawah sedimen dasar laut dekat pantai",
  },
  {
    id: "transisi-paparan-kontinental",
    labelId: "Paparan Kontinental & Lereng",
    armourClassId: "Single Armour (SA) / LWP",
    hazardContextId: "Risiko mekanis menengah terhadap gesekan dasar laut dan aktivitas maritim",
    burialNoteId: "Penanaman atau perlindungan selektif mengikuti kajian rute laut",
  },
  {
    id: "laut-dalam-stabil",
    labelId: "Dataran Abisal Laut Dalam",
    armourClassId: "Light Weight (LW)",
    hazardContextId: "Lingkungan relatif tenang jauh dari jangkar; prioritas rasio kekuatan/berat",
    burialNoteId: "Diletakkan langsung mengikuti kontur dasar laut tanpa pelindung baja berat",
  },
];

export const EXPLORER_NODES: readonly ExplorerNodeSpec[] = [
  {
    id: "pop",
    abbr: "PoP",
    labelId: "Point of Presence & Backhaul",
    zone: "dry-plant",
    zoneLabelId: "Dry Plant (Darat)",
    locationId: "Pusat data kota / simpul jaringan terestrial",
    roleId:
      "Mengagregasikan trafik internet dan data pelanggan sebelum dikirimkan melalui rute backhaul terestrial menuju CLS.",
    opticalPathDetailId: "Sinyal optik terestrial terhubung ke antarmuka klien pada SLTE di CLS.",
    electricalPathDetailId:
      "Memakai pasokan listrik gedung darat; terisolasi penuh dari sistem PFE laut.",
    repairTurnaroundId: "Jam (akses teknisi darat & jalur backhaul)",
    designContextId:
      "Sering menggunakan dua jalur backhaul terpisah untuk ketahanan jaringan kota.",
    glossaryId: "gls-pop",
  },
  {
    id: "cls",
    abbr: "CLS",
    labelId: "Cable Landing Station (CTB, LME/NMS)",
    zone: "dry-plant",
    zoneLabelId: "Dry Plant (Darat)",
    locationId: "Gedung stasiun pendaratan di dekat pantai",
    roleId:
      "Gedung terminasi tempat perangkat transmisi optik, catu daya laut, dan pemantauan saluran beroperasi bersama sistem cadangan daya gedung.",
    opticalPathDetailId:
      "Kabel serat dari BMH masuk ke Cable Terminating Box (CTB) lalu diarahkan ke rak SLTE.",
    electricalPathDetailId:
      "CTB memisahkan konduktor tembaga bertegangan tinggi menuju PFE; LME/NMS memantau status line dan COTDR.",
    repairTurnaroundId: "Jam (pemeliharaan modul darat terencana)",
    designContextId:
      "Menghubungkan lingkungan darat dengan sistem basah berumur desain sekitar 25 tahun.",
    subsystemsNoteId:
      "Mencakup Cable Terminating Box (CTB) untuk isolasi terminasi kabel serta Line Monitoring Equipment / Network Management System (LME/NMS) untuk telemetri saluran.",
    glossaryId: "gls-cls",
  },
  {
    id: "slte",
    abbr: "SLTE",
    labelId: "Submarine Line Terminal Equipment",
    zone: "dry-plant",
    zoneLabelId: "Dry Plant (Darat)",
    locationId: "Ruang transmisi di dalam CLS",
    roleId:
      "Transponder koheren dan multiplexer DWDM yang mengubah trafik data menjadi panjang gelombang optik berkapasitas tinggi.",
    opticalPathDetailId:
      "Membangkitkan dan menerima sinyal DWDM (pita-C atau C+L) pada setiap pasangan serat Tx/Rx.",
    electricalPathDetailId: "Tidak menyalurkan daya DC ke laut; dicatu daya gedung CLS.",
    repairTurnaroundId: "Jam (penggantian kartu line/transponder)",
    designContextId:
      "Pada model Open Cable (ITU-T G.977.1), SLTE dapat berasal dari vendor berbeda dengan wet plant.",
    glossaryId: "gls-slte",
  },
  {
    id: "pfe",
    abbr: "PFE",
    labelId: "Power Feeding Equipment",
    zone: "dry-plant",
    zoneLabelId: "Dry Plant (Darat)",
    locationId: "Ruang daya bertegangan tinggi di dalam CLS",
    roleId:
      "Membangkitkan arus searah (DC) konstan bertegangan tinggi untuk menyalakan seluruh repeater aktif di dasar laut secara seri.",
    opticalPathDetailId: "Tidak membawa sinyal optik.",
    electricalPathDetailId:
      "Aktif hanya pada mode Repeatered (polaritas berlawanan +V / -V antarujung dengan elektrode tanah laut). Nonaktif dan tidak dipasang pada mode Repeaterless.",
    repairTurnaroundId: "Jam (modul konverter redundan di CLS)",
    designContextId:
      "Memiliki sakelar pentanahan (grounding) dan proteksi keselamatan ketat selama pemeliharaan kabel laut.",
    glossaryId: "gls-pfe",
  },
  {
    id: "bmh",
    abbr: "BMH",
    labelId: "Beach Manhole",
    zone: "transisi",
    zoneLabelId: "Zona Transisi Pantai",
    locationId: "Ruang beton bawah tanah di dekat garis pantai",
    roleId:
      "Titik sambung fisik antara kabel laut berperisai (wet plant) dan kabel saluran darat (land cable) menuju CLS.",
    opticalPathDetailId:
      "Sambungan fusi menyambungkan seluruh serat optik laut ke serat kabel darat.",
    electricalPathDetailId:
      "Pada sistem ber-repeater, sambungan terisolasi meneruskan konduktor daya tembaga dari PFE ke laut.",
    repairTurnaroundId: "Hari (penggalian akses darat pantai)",
    designContextId:
      "Dalam tata ruang laut Indonesia (Kepmen KP 14/2021), titik BMH menjadi simpul koordinat pendaratan resmi.",
    glossaryId: "gls-bmh",
  },
  {
    id: "shore",
    abbr: "Shore End",
    labelId: "Kabel Pesisir Berperisai",
    zone: "wet-plant",
    zoneLabelId: "Wet Plant (Perairan Dangkal)",
    locationId: "Perairan pantai hingga paparan kontinental",
    roleId:
      "Melindungi inti serat optik dan konduktor daya dari ancaman jangkar kapal, pukat dasar, serta abrasi gelombang pantai.",
    opticalPathDetailId: "Membawa seluruh pasangan serat optik di dalam tabung inti bertekanan.",
    electricalPathDetailId:
      "Membawa arus DC PFE jika sistem memakai repeater aktif, atau tanpa arus DC pada sistem repeaterless.",
    repairTurnaroundId: "Minggu (mobilisasi kapal kabel & penyelam pantai)",
    designContextId:
      "Memakai lapisan kawat baja pelindung lebih tebal (misalnya Double/Single Armour) daripada kabel laut dalam.",
  },
  {
    id: "repeater",
    abbr: "Repeater",
    labelId: "Repeater EDFA & Equalizer",
    zone: "wet-plant",
    zoneLabelId: "Wet Plant (Laut Dalam)",
    locationId: "Rumah tekan baja di dasar laut sepanjang rute ber-repeater",
    roleId:
      "Menguatkan kembali sinyal cahaya DWDM yang melemah akibat redaman serat menggunakan pompa laser dan serat terdoping erbium.",
    opticalPathDetailId:
      "Menguatkan sinyal secara langsung di domain optik tanpa konversi ke listrik.",
    electricalPathDetailId:
      "Mengkonsumsi daya listrik DC seri dari konduktor PFE dan mengalami jatuh tegangan internal per unit.",
    repairTurnaroundId: "Minggu (pengangkatan oleh kapal kabel khusus)",
    designContextId:
      "Mencakup fungsi gain equalization (Equalizer) pada bentang panjang agar daya antar-panjang gelombang tetap seimbang.",
    subsystemsNoteId:
      "Unit equalizer optik (Gain Flattening / Equalizer) sering disematkan bersama rangkaian repeater untuk menjaga keseragaman spektrum pita lebar.",
    glossaryId: "gls-edfa",
  },
  {
    id: "bu",
    abbr: "BU",
    labelId: "Branching Unit",
    zone: "wet-plant",
    zoneLabelId: "Wet Plant (Percabangan)",
    locationId: "Titik percabangan tiga arah di dasar laut",
    roleId:
      "Membagi sebagian pasangan serat dari kabel utama (trunk) menuju pantai tambahan (branch) serta mengatur sakelar rute daya DC.",
    opticalPathDetailId:
      "Mengarahkan pasangan serat tertentu ke jalur cabang sambil meneruskan serat utama ke ujung jauh.",
    electricalPathDetailId:
      "Pada sistem ber-repeater, sakelar relai vakum dapat mengalihkan arus DC ke cabang atau elektrode tanah laut saat isolasi gangguan.",
    repairTurnaroundId: "Minggu (operasi pengangkatan tiga-arah oleh kapal kabel)",
    designContextId:
      "Memungkinkan topologi trunk-and-branch melayani beberapa pulau atau negara dari satu sistem utama.",
    glossaryId: "gls-bu",
  },
  {
    id: "ropa",
    abbr: "ROPA",
    labelId: "Remote Optically Pumped Amplifier",
    zone: "wet-plant",
    zoneLabelId: "Wet Plant (Repeaterless)",
    locationId: "Titik laut lepas pada sistem repeaterless jarak menengah-jauh",
    roleId:
      "Menguatkan sinyal secara optik di bawah laut menggunakan serat erbium pasif yang dipompa oleh laser daya tinggi dari CLS darat.",
    opticalPathDetailId:
      "Menerima cahaya pompa (sekitar 1480 nm) dari darat untuk menguatkan sinyal data pada pita 1550 nm.",
    electricalPathDetailId:
      "Tidak memakai pasokan listrik DC dan tidak membutuhkan PFE maupun elektrode tanah laut.",
    repairTurnaroundId:
      "Minggu jika terjadi putus kabel fisik, tanpa komponen aktif listrik di laut",
    designContextId:
      "Dipakai pada mode Repeaterless ROPA (ITU-T G.973) untuk melampaui batas jarak terminal darat biasa tanpa PFE.",
    glossaryId: "gls-ropa",
  },
];

export function getModeSpec(mode: SystemExplorerMode): SystemModeSpec {
  return SYSTEM_MODES.find((item) => item.id === mode) ?? SYSTEM_MODES[0];
}

export function getArmourPresetSpec(preset: ArmourPresetId): ArmourPresetSpec {
  return ARMOUR_PRESETS.find((item) => item.id === preset) ?? ARMOUR_PRESETS[0];
}

export function getNodeSpec(nodeId: ExplorerNodeId): ExplorerNodeSpec {
  return EXPLORER_NODES.find((item) => item.id === nodeId) ?? EXPLORER_NODES[0];
}

export function getDefaultNodeForMode(mode: SystemExplorerMode): ExplorerNodeId {
  return mode === "repeaterless-ropa" ? "ropa" : mode === "repeaterless-edfa" ? "bmh" : "repeater";
}

export function getExplorerSummaryRows(
  mode: SystemExplorerMode,
  armourPreset: ArmourPresetId
): ExplorerTableRow[] {
  const modeSpec = getModeSpec(mode);
  const armourSpec = getArmourPresetSpec(armourPreset);
  const activeSet = new Set(modeSpec.activeNodeIds);

  return EXPLORER_NODES.map((node) => {
    const isActiveInMode = activeSet.has(node.id);
    const componentLabelId =
      node.id === "shore" ? `${node.labelId} (${armourSpec.armourClassId})` : node.labelId;

    let electricalFunctionId = node.electricalPathDetailId;
    if (!modeSpec.dcPfeActive && node.id === "cls") {
      electricalFunctionId =
        "Tidak ada pemisahan daya DC PFE; CTB meneruskan serat optik ke SLTE dan LME/NMS memantau serat dari darat.";
    } else if (
      !modeSpec.dcPfeActive &&
      (node.id === "pfe" || node.id === "repeater" || node.id === "bu")
    ) {
      electricalFunctionId = "Tidak aktif pada mode repeaterless (0 V daya DC PFE).";
    } else if (node.id === "ropa" && mode !== "repeaterless-ropa") {
      electricalFunctionId = "Tidak digunakan pada mode ini.";
    }

    return {
      nodeId: node.id,
      abbr: node.abbr,
      componentLabelId,
      zoneLabelId: node.zoneLabelId,
      isActiveInMode,
      statusLabelId: isActiveInMode ? "Aktif pada mode ini" : "Tidak dipakai pada mode ini",
      opticalFunctionId: node.opticalPathDetailId,
      electricalFunctionId,
      repairTurnaroundId: node.repairTurnaroundId,
    };
  });
}
