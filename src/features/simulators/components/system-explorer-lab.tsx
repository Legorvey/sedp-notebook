"use client";

import Link from "next/link";
import { domAnimation, LazyMotion, MotionConfig, m } from "motion/react";
import { useId, useState } from "react";
import { BathymetryContours } from "@/components/layout/bathymetry-contours";
import { Button } from "@/components/ui/button";
import {
  ARMOUR_PRESETS,
  ARMOUR_PRESET_CAVEAT_ID,
  EDUCATIONAL_MODEL_DISCLAIMER_ID,
  EXPLORER_NODES,
  getArmourPresetSpec,
  getDefaultNodeForMode,
  getExplorerSummaryRows,
  getModeSpec,
  getNodeSpec,
  SYSTEM_MODES,
  type ArmourPresetId,
  type ExplorerNodeId,
  type SystemExplorerMode,
} from "@/features/simulators/engine/system-explorer";
import { cn } from "@/lib/utils";

interface SystemExplorerLabProps {
  variant?: "full" | "embedded";
}

export function SystemExplorerLab({ variant = "full" }: SystemExplorerLabProps) {
  const [mode, setMode] = useState<SystemExplorerMode>("repeatered");
  const [armourPreset, setArmourPreset] = useState<ArmourPresetId>("pesisir-dangkal-buried");
  const [selectedNodeId, setSelectedNodeId] = useState<ExplorerNodeId>("repeater");
  const [pulseKey, setPulseKey] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState(
    "Mode aktif: Repeatered (Turnkey Terpadu). Komponen terpilih: Repeater EDFA."
  );

  const svgTitleId = useId();
  const svgDescId = useId();

  const modeSpec = getModeSpec(mode);
  const armourSpec = getArmourPresetSpec(armourPreset);
  const selectedNode = getNodeSpec(selectedNodeId);
  const summaryRows = getExplorerSummaryRows(mode, armourPreset);
  const activeNodeSet = new Set(modeSpec.activeNodeIds);

  function handleSelectMode(nextMode: SystemExplorerMode) {
    const spec = getModeSpec(nextMode);
    setMode(nextMode);
    const nextActiveSet = new Set(spec.activeNodeIds);
    const nextNode = nextActiveSet.has(selectedNodeId)
      ? selectedNodeId
      : getDefaultNodeForMode(nextMode);
    setSelectedNodeId(nextNode);
    const nodeSpec = getNodeSpec(nextNode);
    setLiveAnnouncement(
      `Mode diubah ke ${spec.labelId}. Jalur daya DC PFE ${spec.dcPfeActive ? "aktif" : "nonaktif (0 V)"}. Komponen terpilih: ${nodeSpec.abbr}.`
    );
  }

  function handleSelectArmour(nextPreset: ArmourPresetId) {
    const spec = getArmourPresetSpec(nextPreset);
    setArmourPreset(nextPreset);
    setLiveAnnouncement(
      `Profil pelindung pesisir ilustratif diubah ke ${spec.labelId} (${spec.armourClassId}).`
    );
  }

  function handleSelectNode(nodeId: ExplorerNodeId) {
    const node = getNodeSpec(nodeId);
    setSelectedNodeId(nodeId);
    const activeLabel = activeNodeSet.has(nodeId) ? "aktif" : "tidak dipakai pada mode ini";
    setLiveAnnouncement(
      `Memeriksa komponen ${node.abbr} (${node.labelId}), status ${activeLabel}.`
    );
  }

  function handleSimulateSignal() {
    setPulseKey((prev) => prev + 1);
    setLiveAnnouncement(
      `Simulasi lintasan sinyal dijalankan pada mode ${modeSpec.shortLabelId}. Sinyal optik aktif dari PoP ke SLTE tujuan; jalur DC PFE ${modeSpec.dcPfeActive ? "mengalir seri ke repeater" : "tidak aktif"}.`
    );
  }

  function handleReset() {
    setMode("repeatered");
    setArmourPreset("pesisir-dangkal-buried");
    setSelectedNodeId("repeater");
    setPulseKey(0);
    setLiveAnnouncement(
      "Parameter diatur ulang ke bawaan: mode Repeatered (Turnkey Terpadu), profil Pesisir Dangkal, komponen Repeater EDFA."
    );
  }

  const isSelectedActive = activeNodeSet.has(selectedNode.id);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <section
          aria-label="Eksplorer Arsitektur Sistem Kabel Laut Ujung-ke-Ujung"
          className="abyss-bay relative overflow-hidden rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-4 text-sedp-ink sm:p-6"
        >
          <BathymetryContours className="absolute inset-x-0 bottom-0 h-28 w-full text-sedp-accent opacity-[0.06]" />

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sedp-subtle-border pb-4">
              <div>
                <p className="font-mono text-xs font-medium text-sedp-accent">
                  Instrumen Eksplorasi Arsitektur ({modeSpec.standardRef})
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-sedp-ink sm:text-xl">
                  {modeSpec.labelId}
                </h3>
                <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-sedp-muted">
                  {modeSpec.summaryId}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" onClick={handleSimulateSignal}>
                  Simulasikan Sinyal
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Atur Ulang Parameter
                </Button>
                {variant === "embedded" && (
                  <Link
                    href="/lab/eksplorer-sistem/"
                    className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-3.5 py-2 text-sm font-medium text-sedp-ink hover:bg-sedp-inset hover:text-sedp-accent"
                  >
                    Buka Lab Penuh
                  </Link>
                )}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-7">
                <p className="text-xs font-semibold text-sedp-muted">
                  1. Pilih Mode Arsitektur Sistem
                </p>
                <div
                  role="group"
                  aria-label="Pilih arsitektur sistem kabel laut"
                  className="flex flex-wrap gap-2"
                >
                  {SYSTEM_MODES.map((item) => {
                    const active = mode === item.id;
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        aria-pressed={active}
                        onClick={() => handleSelectMode(item.id)}
                      >
                        {item.shortLabelId}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 lg:col-span-5">
                <p className="text-xs font-semibold text-sedp-muted">
                  2. Profil Pelindung Pantai (Ilustratif)
                </p>
                <div
                  role="group"
                  aria-label="Pilih profil pelindung dasar laut ilustratif"
                  className="flex flex-wrap gap-2"
                >
                  {ARMOUR_PRESETS.map((preset) => {
                    const active = armourPreset === preset.id;
                    return (
                      <Button
                        key={preset.id}
                        type="button"
                        variant={active ? "default" : "outline"}
                        aria-pressed={active}
                        onClick={() => handleSelectArmour(preset.id)}
                      >
                        {preset.armourClassId.split(" (")[0]}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs leading-relaxed text-sedp-muted">{ARMOUR_PRESET_CAVEAT_ID}</p>
              </div>
            </div>

            <div className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 font-medium text-sedp-ink">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1 w-6 rounded-sm bg-[#35D0BA]"
                    />
                    Jalur Sinyal Optik (Cahaya 1550 nm)
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium text-sedp-ink">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-block h-0.5 w-6 border-t-2 border-dashed",
                        modeSpec.dcPfeActive ? "border-[#F5A623]" : "border-sedp-muted"
                      )}
                    />
                    {modeSpec.dcPfeActive
                      ? "Jalur Daya Listrik DC (PFE + Tanah Laut)"
                      : "Jalur Daya DC PFE: Nonaktif (0 V)"}
                  </span>
                </div>
                <span className="font-mono text-xs text-sedp-muted">
                  Pelindung: {armourSpec.armourClassId}
                </span>
              </div>

              <div className="overflow-x-auto">
                <svg
                  role="img"
                  aria-labelledby={`${svgTitleId} ${svgDescId}`}
                  viewBox="0 0 960 320"
                  className="h-auto min-w-[680px] w-full"
                >
                  <title id={svgTitleId}>
                    Diagram arsitektur ujung-ke-ujung sistem kabel laut mode {modeSpec.labelId}
                  </title>
                  <desc id={svgDescId}>
                    Menampilkan PoP darat, CLS berisi SLTE dan PFE, BMH di pantai, kabel pesisir{" "}
                    {armourSpec.armourClassId}, serta wet plant di dasar laut. Jalur optik aktif
                    sepanjang rute; jalur daya DC PFE{" "}
                    {modeSpec.dcPfeActive ? "aktif menuju repeater" : "tidak aktif"}.
                  </desc>

                  {/* Zone backdrops */}
                  <rect
                    x="12"
                    y="12"
                    width="240"
                    height="296"
                    rx="8"
                    fill="#081826"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="262"
                    y="12"
                    width="136"
                    height="296"
                    rx="8"
                    fill="#0A1E30"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="408"
                    y="12"
                    width="420"
                    height="296"
                    rx="8"
                    fill="#081826"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="838"
                    y="12"
                    width="110"
                    height="296"
                    rx="8"
                    fill="#081826"
                    stroke="#1F3B52"
                  />

                  <text
                    x="24"
                    y="34"
                    fill="#A7BCC9"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    DRY PLANT (DARAT)
                  </text>
                  <text
                    x="274"
                    y="34"
                    fill="#A7BCC9"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    TRANSISI
                  </text>
                  <text
                    x="420"
                    y="34"
                    fill="#A7BCC9"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    WET PLANT (DASAR LAUT)
                  </text>
                  <text
                    x="850"
                    y="34"
                    fill="#A7BCC9"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    UJUNG B
                  </text>

                  {/* Sea surface & seabed slope */}
                  <path
                    d="M 272 108 Q 335 104 398 112 T 560 110 T 828 112"
                    fill="none"
                    stroke="#618AA3"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="420" y="100" fill="#A7BCC9" fontSize="11" fontFamily="var(--font-mono)">
                    Permukaan Laut
                  </text>
                  <path
                    d="M 262 178 L 360 178 L 440 232 L 828 232"
                    fill="none"
                    stroke="#618AA3"
                    strokeWidth="1.5"
                  />
                  <text x="580" y="250" fill="#A7BCC9" fontSize="11" fontFamily="var(--font-mono)">
                    Dasar Laut ({armourSpec.armourClassId})
                  </text>

                  {/* Optical Path */}
                  <path
                    d="M 96 128 L 160 128 L 288 128 L 352 162 L 456 206 L 784 206 L 856 128"
                    fill="none"
                    stroke="#35D0BA"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {pulseKey > 0 && (
                    <m.circle
                      key={`opt-pulse-${pulseKey}`}
                      r="5.5"
                      fill="#35D0BA"
                      initial={{ cx: 96, cy: 128, opacity: 1 }}
                      animate={{
                        cx: [96, 288, 352, 456, 784, 856],
                        cy: [128, 128, 162, 206, 206, 128],
                        opacity: [1, 1, 1, 1, 1, 0.2],
                      }}
                      transition={{ duration: 1.4, ease: "easeInOut" }}
                    />
                  )}

                  {/* DC Power Path when repeatered */}
                  {modeSpec.dcPfeActive ? (
                    <>
                      <path
                        d="M 196 226 L 288 226 L 352 176 L 456 220 L 784 220 L 892 226"
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="2.5"
                        strokeDasharray="7 5"
                      />
                      {/* Sea Earth returns */}
                      <path
                        d="M 196 244 L 196 274 L 296 274"
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="1.8"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="148"
                        y="290"
                        fill="#F5A623"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        Sea Earth (+V / -V DC Seri)
                      </text>
                    </>
                  ) : (
                    <g>
                      <rect
                        x="130"
                        y="258"
                        width="255"
                        height="28"
                        rx="4"
                        fill="#132F46"
                        stroke="#618AA3"
                      />
                      <text
                        x="142"
                        y="276"
                        fill="#EDF4F7"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        Jalur Daya DC PFE: Tidak Aktif (0 V)
                      </text>
                    </g>
                  )}

                  {/* Branching Unit Spur */}
                  <path
                    d={
                      modeSpec.dcPfeActive
                        ? "M 672 206 L 672 274 L 775 274"
                        : "M 672 206 L 672 274 L 775 274"
                    }
                    fill="none"
                    stroke={activeNodeSet.has("bu") ? "#35D0BA" : "#3F5260"}
                    strokeWidth="2.5"
                    strokeDasharray={activeNodeSet.has("bu") ? undefined : "4 4"}
                  />
                  <text
                    x="698"
                    y="292"
                    fill={activeNodeSet.has("bu") ? "#EDF4F7" : "#A7BCC9"}
                    fontSize="11"
                    fontFamily="var(--font-sans)"
                  >
                    {activeNodeSet.has("bu") ? "Cabang ke CLS C" : "Cabang (Mode Trunk-Branch)"}
                  </text>

                  {/* Node: PoP */}
                  <g>
                    <rect
                      x="24"
                      y="94"
                      width="72"
                      height="68"
                      rx="6"
                      fill={selectedNodeId === "pop" ? "#132F46" : "#0E2436"}
                      stroke={selectedNodeId === "pop" ? "#35D0BA" : "#618AA3"}
                      strokeWidth={selectedNodeId === "pop" ? "2.5" : "1.5"}
                    />
                    <text
                      x="60"
                      y="124"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="13"
                      fontWeight="700"
                    >
                      PoP
                    </text>
                    <text x="60" y="142" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      Backhaul
                    </text>
                  </g>

                  {/* Node: CLS container */}
                  <g>
                    <rect
                      x="116"
                      y="64"
                      width="124"
                      height="182"
                      rx="8"
                      fill={selectedNodeId === "cls" ? "#132F46" : "#0E2436"}
                      stroke={selectedNodeId === "cls" ? "#35D0BA" : "#618AA3"}
                      strokeWidth={selectedNodeId === "cls" ? "2.5" : "1.5"}
                    />
                    <text
                      x="178"
                      y="84"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="12"
                      fontWeight="700"
                    >
                      CLS (CTB / NMS)
                    </text>

                    {/* SLTE */}
                    <rect
                      x="128"
                      y="98"
                      width="100"
                      height="58"
                      rx="6"
                      fill={selectedNodeId === "slte" ? "#132F46" : "#081826"}
                      stroke={selectedNodeId === "slte" ? "#35D0BA" : "#618AA3"}
                      strokeWidth={selectedNodeId === "slte" ? "2.5" : "1.5"}
                    />
                    <text
                      x="178"
                      y="124"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="12"
                      fontWeight="700"
                    >
                      SLTE
                    </text>
                    <text x="178" y="141" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {modeSpec.openCableDisaggregated ? "Open G.977.1" : "DWDM Terminal"}
                    </text>

                    {/* PFE */}
                    <rect
                      x="128"
                      y="174"
                      width="100"
                      height="58"
                      rx="6"
                      fill={
                        selectedNodeId === "pfe"
                          ? "#132F46"
                          : modeSpec.dcPfeActive
                            ? "#081826"
                            : "#0B1926"
                      }
                      stroke={
                        selectedNodeId === "pfe"
                          ? "#35D0BA"
                          : modeSpec.dcPfeActive
                            ? "#F5A623"
                            : "#3F5260"
                      }
                      strokeWidth={selectedNodeId === "pfe" ? "2.5" : "1.5"}
                      strokeDasharray={modeSpec.dcPfeActive ? undefined : "4 3"}
                    />
                    <text
                      x="178"
                      y="200"
                      textAnchor="middle"
                      fill={modeSpec.dcPfeActive ? "#EDF4F7" : "#A7BCC9"}
                      fontSize="12"
                      fontWeight="700"
                    >
                      PFE
                    </text>
                    <text x="178" y="218" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {modeSpec.dcPfeActive ? "DC Arus Konstan" : "Tidak Dipakai"}
                    </text>
                  </g>

                  {/* Node: BMH */}
                  <g>
                    <rect
                      x="274"
                      y="132"
                      width="66"
                      height="56"
                      rx="6"
                      fill={selectedNodeId === "bmh" ? "#132F46" : "#0E2436"}
                      stroke={selectedNodeId === "bmh" ? "#35D0BA" : "#618AA3"}
                      strokeWidth={selectedNodeId === "bmh" ? "2.5" : "1.5"}
                    />
                    <text
                      x="307"
                      y="158"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="13"
                      fontWeight="700"
                    >
                      BMH
                    </text>
                    <text x="307" y="174" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      Pantai
                    </text>
                  </g>

                  {/* Node: Shore End */}
                  <g>
                    <rect
                      x="348"
                      y="136"
                      width="84"
                      height="52"
                      rx="6"
                      fill={selectedNodeId === "shore" ? "#132F46" : "#0E2436"}
                      stroke={selectedNodeId === "shore" ? "#35D0BA" : "#618AA3"}
                      strokeWidth={selectedNodeId === "shore" ? "2.5" : "1.5"}
                    />
                    <text
                      x="390"
                      y="159"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="11"
                      fontWeight="700"
                    >
                      Shore End
                    </text>
                    <text x="390" y="175" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {armourSpec.armourClassId.split(" (")[0]}
                    </text>
                  </g>

                  {/* Node: Repeater / Equalizer */}
                  <g>
                    <rect
                      x="472"
                      y="174"
                      width="112"
                      height="60"
                      rx="6"
                      fill={
                        selectedNodeId === "repeater"
                          ? "#132F46"
                          : activeNodeSet.has("repeater")
                            ? "#0E2436"
                            : "#0B1926"
                      }
                      stroke={
                        selectedNodeId === "repeater"
                          ? "#35D0BA"
                          : activeNodeSet.has("repeater")
                            ? "#618AA3"
                            : "#3F5260"
                      }
                      strokeWidth={selectedNodeId === "repeater" ? "2.5" : "1.5"}
                      strokeDasharray={activeNodeSet.has("repeater") ? undefined : "4 3"}
                    />
                    <text
                      x="528"
                      y="200"
                      textAnchor="middle"
                      fill={activeNodeSet.has("repeater") ? "#EDF4F7" : "#A7BCC9"}
                      fontSize="12"
                      fontWeight="700"
                    >
                      Repeater EDFA
                    </text>
                    <text x="528" y="218" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {activeNodeSet.has("repeater") ? "+ Equalizer" : "Tidak Aktif"}
                    </text>
                  </g>

                  {/* Node: ROPA */}
                  <g>
                    <rect
                      x="472"
                      y="96"
                      width="112"
                      height="52"
                      rx="6"
                      fill={
                        selectedNodeId === "ropa"
                          ? "#132F46"
                          : activeNodeSet.has("ropa")
                            ? "#0E2436"
                            : "#0B1926"
                      }
                      stroke={
                        selectedNodeId === "ropa"
                          ? "#35D0BA"
                          : activeNodeSet.has("ropa")
                            ? "#35D0BA"
                            : "#3F5260"
                      }
                      strokeWidth={selectedNodeId === "ropa" ? "2.5" : "1.5"}
                      strokeDasharray={activeNodeSet.has("ropa") ? undefined : "4 3"}
                    />
                    <text
                      x="528"
                      y="120"
                      textAnchor="middle"
                      fill={activeNodeSet.has("ropa") ? "#EDF4F7" : "#A7BCC9"}
                      fontSize="12"
                      fontWeight="700"
                    >
                      ROPA Pasif
                    </text>
                    <text x="528" y="136" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {activeNodeSet.has("ropa") ? "Pompa Optik Darat" : "Mode ROPA Saja"}
                    </text>
                  </g>

                  {/* Node: BU */}
                  <g>
                    <rect
                      x="622"
                      y="174"
                      width="100"
                      height="60"
                      rx="6"
                      fill={
                        selectedNodeId === "bu"
                          ? "#132F46"
                          : activeNodeSet.has("bu")
                            ? "#0E2436"
                            : "#0B1926"
                      }
                      stroke={
                        selectedNodeId === "bu"
                          ? "#35D0BA"
                          : activeNodeSet.has("bu")
                            ? "#618AA3"
                            : "#3F5260"
                      }
                      strokeWidth={selectedNodeId === "bu" ? "2.5" : "1.5"}
                      strokeDasharray={activeNodeSet.has("bu") ? undefined : "4 3"}
                    />
                    <text
                      x="672"
                      y="200"
                      textAnchor="middle"
                      fill={activeNodeSet.has("bu") ? "#EDF4F7" : "#A7BCC9"}
                      fontSize="12"
                      fontWeight="700"
                    >
                      Branching Unit
                    </text>
                    <text x="672" y="218" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      {activeNodeSet.has("bu") ? "Serat + Sakelar DC" : "Opsional Trunk"}
                    </text>
                  </g>

                  {/* Node: Far End CLS */}
                  <g>
                    <rect
                      x="850"
                      y="96"
                      width="86"
                      height="142"
                      rx="6"
                      fill="#0E2436"
                      stroke="#618AA3"
                      strokeWidth="1.5"
                    />
                    <text
                      x="893"
                      y="124"
                      textAnchor="middle"
                      fill="#EDF4F7"
                      fontSize="12"
                      fontWeight="700"
                    >
                      CLS B
                    </text>
                    <text x="893" y="144" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                      SLTE B
                    </text>
                    <text
                      x="893"
                      y="214"
                      textAnchor="middle"
                      fill={modeSpec.dcPfeActive ? "#F5A623" : "#A7BCC9"}
                      fontSize="10"
                    >
                      {modeSpec.dcPfeActive ? "PFE (-V)" : "Tanpa PFE"}
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-sedp-muted">
                3. Pilih Komponen untuk Inspeksi Detail (Keyboard &amp; Sentuh)
              </p>
              <div
                role="group"
                aria-label="Pilih komponen sistem untuk diinspeksi"
                className="flex flex-wrap gap-2"
              >
                {EXPLORER_NODES.map((node) => {
                  const selected = selectedNodeId === node.id;
                  const activeInMode = activeNodeSet.has(node.id);
                  return (
                    <Button
                      key={node.id}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      aria-pressed={selected}
                      onClick={() => handleSelectNode(node.id)}
                      className={cn(!activeInMode && !selected && "opacity-75")}
                    >
                      <span>{node.abbr}</span>
                      {!activeInMode && <span className="text-xs font-normal">(Nonaktif)</span>}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div
              aria-live="polite"
              data-testid="explorer-inspector"
              className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-4 sm:p-5"
            >
              <p className="sr-only">{liveAnnouncement}</p>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-sedp-accent">
                    {selectedNode.zoneLabelId} |{" "}
                    {isSelectedActive
                      ? "Status: Aktif pada mode ini"
                      : "Status: Tidak dipakai pada mode ini"}
                  </p>
                  <h4 className="mt-1 font-display text-lg font-bold text-sedp-ink">
                    {selectedNode.abbr}: {selectedNode.labelId}
                  </h4>
                  <p className="mt-1 text-sm text-sedp-muted">Lokasi: {selectedNode.locationId}</p>
                </div>

                {selectedNode.glossaryId && (
                  <Link
                    href={`/referensi/glosarium/#${selectedNode.glossaryId}`}
                    className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-inset px-3 py-2 text-xs font-semibold text-sedp-accent hover:bg-sedp-canvas"
                  >
                    Lihat di Glosarium
                  </Link>
                )}
              </div>

              <dl className="mt-4 grid gap-4 border-t border-sedp-subtle-border pt-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-sedp-muted">Peran Utama</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-sedp-ink">
                    {selectedNode.roleId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-sedp-muted">Jalur Sinyal Optik</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-sedp-ink">
                    {selectedNode.opticalPathDetailId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-sedp-muted">Jalur Daya Listrik DC</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-sedp-ink">
                    {!modeSpec.dcPfeActive &&
                    (selectedNode.id === "pfe" ||
                      selectedNode.id === "repeater" ||
                      selectedNode.id === "bu")
                      ? "Tidak aktif pada mode repeaterless (0 V daya DC PFE)."
                      : selectedNode.electricalPathDetailId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-sedp-muted">
                    Estimasi Skala Perbaikan &amp; Konteks Desain
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-sedp-ink">
                    <span className="font-mono text-xs text-sedp-accent">
                      {selectedNode.repairTurnaroundId}
                    </span>
                    . {selectedNode.designContextId}
                  </dd>
                </div>
              </dl>

              {selectedNode.subsystemsNoteId && (
                <p className="mt-3 rounded-md border border-sedp-subtle-border bg-sedp-inset p-3 text-xs leading-relaxed text-sedp-ink">
                  <strong>Subsistem terkait:</strong> {selectedNode.subsystemsNoteId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-base font-bold text-sedp-ink">
                Ringkasan Tabel Komponen (Sinkron dengan Diagram)
              </h4>
              <div
                tabIndex={0}
                role="region"
                aria-label="Tabel ringkasan komponen arsitektur sistem kabel laut"
                className="overflow-x-auto rounded-md border border-sedp-control-border bg-sedp-surface"
              >
                <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-sm">
                  <caption className="border-b border-sedp-subtle-border bg-sedp-inset px-4 py-2.5 text-left text-xs font-semibold text-sedp-ink">
                    Mode: {modeSpec.labelId} | Profil Pantai: {armourSpec.armourClassId}
                  </caption>
                  <thead>
                    <tr className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Komponen
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Zona
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Status Mode
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Jalur Optik
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Jalur Daya DC
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        Skala Perbaikan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((row) => (
                      <tr
                        key={row.nodeId}
                        className={cn(
                          "border-b border-sedp-subtle-border last:border-b-0",
                          selectedNodeId === row.nodeId && "bg-sedp-inset"
                        )}
                      >
                        <th scope="row" className="px-3 py-2.5 font-semibold text-sedp-ink">
                          <span className="font-mono text-sedp-accent">{row.abbr}</span>{" "}
                          <span className="font-normal text-sedp-muted">
                            ({row.componentLabelId})
                          </span>
                        </th>
                        <td className="px-3 py-2.5 text-sedp-ink">{row.zoneLabelId}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-sedp-ink">
                          {row.statusLabelId}
                        </td>
                        <td className="px-3 py-2.5 text-sedp-muted">{row.opticalFunctionId}</td>
                        <td className="px-3 py-2.5 text-sedp-muted">{row.electricalFunctionId}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-sedp-ink">
                          {row.repairTurnaroundId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside
              aria-label="Penafian Pemodelan Edukatif"
              className="rounded-md border border-sedp-control-border bg-sedp-inset p-3.5 text-xs leading-relaxed text-sedp-ink"
            >
              <p className="font-semibold text-sedp-accent">Penafian Pemodelan Edukatif</p>
              <p className="mt-1 text-sedp-muted">{EDUCATIONAL_MODEL_DISCLAIMER_ID}</p>
            </aside>
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
