"use client";

import Link from "next/link";
import { domAnimation, LazyMotion, MotionConfig, m, useReducedMotion } from "motion/react";
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
  const [signalVerified, setSignalVerified] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState(
    "Mode aktif: Repeatered (Turnkey Terpadu). Komponen terpilih: Repeater EDFA."
  );

  const shouldReduceMotion = useReducedMotion();
  const svgTitleId = useId();
  const svgDescId = useId();

  const modeSpec = getModeSpec(mode);
  const armourSpec = getArmourPresetSpec(armourPreset);
  const selectedNode = getNodeSpec(selectedNodeId);
  const summaryRows = getExplorerSummaryRows(mode, armourPreset);
  const activeNodeSet = new Set(modeSpec.activeNodeIds);

  const TitleHeading = variant === "full" ? "h2" : "h3";
  const SubHeading = variant === "full" ? "h3" : "h4";

  function handleSelectMode(nextMode: SystemExplorerMode) {
    const spec = getModeSpec(nextMode);
    setMode(nextMode);
    setSignalVerified(false);
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
    setSignalVerified(true);
    if (!shouldReduceMotion) {
      setPulseKey((prev) => prev + 1);
    }
    setLiveAnnouncement(
      `Simulasi lintasan sinyal dijalankan pada mode ${modeSpec.shortLabelId}. Sinyal optik aktif dari PoP ke SLTE tujuan; jalur DC PFE ${modeSpec.dcPfeActive ? "mengalir seri ke repeater" : "tidak aktif"}.`
    );
  }

  function handleReset() {
    setMode("repeatered");
    setArmourPreset("pesisir-dangkal-buried");
    setSelectedNodeId("repeater");
    setPulseKey(0);
    setSignalVerified(false);
    setLiveAnnouncement(
      "Parameter diatur ulang ke bawaan: mode Repeatered (Turnkey Terpadu), profil Pesisir Dangkal, komponen Repeater EDFA."
    );
  }

  const isSelectedActive = activeNodeSet.has(selectedNode.id);
  const isRopaMode = mode === "repeaterless-ropa";
  const isRepeateredMode = modeSpec.dcPfeActive;

  const svgTitleText = `Diagram arsitektur ujung-ke-ujung sistem kabel laut mode ${modeSpec.labelId}`;
  const svgDescText = `Menampilkan PoP darat, CLS berisi ${modeSpec.dcPfeActive ? "SLTE dan PFE" : "SLTE tanpa PFE"}, BMH di pantai, kabel pesisir ${armourSpec.armourClassId}, serta wet plant di dasar laut. Jalur optik aktif sepanjang rute; ${isRopaMode ? "modul ROPA pasif di dasar laut dipompa cahaya laser dari darat tanpa daya DC PFE." : modeSpec.dcPfeActive ? "jalur daya DC PFE aktif menuju repeater dan branching unit dengan elektrode tanah laut di kedua ujung." : "tanpa penguat aktif maupun jalur daya DC PFE di laut."}`;

  const opticalPathD = isRopaMode
    ? "M 96 128 L 160 128 L 288 128 L 352 162 L 456 204 L 528 204 L 784 204 L 856 128"
    : isRepeateredMode
      ? "M 96 128 L 160 128 L 288 128 L 352 162 L 456 204 L 784 204 L 856 128"
      : "M 96 128 L 160 128 L 288 128 L 352 162 L 456 162 L 784 162 L 856 128";

  const selectedElectricalDetail =
    !modeSpec.dcPfeActive && selectedNode.id === "cls"
      ? "Tidak ada pemisahan daya DC PFE; CTB meneruskan serat optik ke SLTE dan LME/NMS memantau serat dari darat."
      : !modeSpec.dcPfeActive &&
          (selectedNode.id === "pfe" || selectedNode.id === "repeater" || selectedNode.id === "bu")
        ? "Tidak aktif pada mode repeaterless (0 V daya DC PFE)."
        : selectedNode.electricalPathDetailId;

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
                <TitleHeading className="mt-1 font-display text-lg font-bold text-sedp-ink sm:text-xl">
                  {modeSpec.labelId}
                </TitleHeading>
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
                    {isRopaMode
                      ? "Jalur Sinyal Optik + Pompa Laser ROPA (~1480 nm)"
                      : "Jalur Sinyal Optik (Cahaya 1550 nm)"}
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
                <div className="flex flex-wrap items-center gap-3">
                  {signalVerified && (
                    <span
                      data-testid="signal-status-badge"
                      className="rounded-sm border border-sedp-verified bg-sedp-inset px-2 py-0.5 font-mono text-xs font-semibold text-sedp-verified"
                    >
                      Lintasan Sinyal Aktif Terverifikasi
                    </span>
                  )}
                  <span className="font-mono text-xs text-sedp-muted">
                    Pelindung: {armourSpec.armourClassId}
                  </span>
                </div>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="Diagram skematik arsitektur sistem kabel laut"
                className="overflow-x-auto"
              >
                <svg
                  role="img"
                  aria-labelledby={`${svgTitleId} ${svgDescId}`}
                  viewBox="0 0 960 326"
                  className="h-auto min-w-[680px] w-full"
                >
                  <title id={svgTitleId}>{svgTitleText}</title>
                  <desc id={svgDescId}>{svgDescText}</desc>

                  <rect
                    x="12"
                    y="12"
                    width="240"
                    height="302"
                    rx="8"
                    fill="#081826"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="262"
                    y="12"
                    width="136"
                    height="302"
                    rx="8"
                    fill="#0A1E30"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="408"
                    y="12"
                    width="420"
                    height="302"
                    rx="8"
                    fill="#081826"
                    stroke="#1F3B52"
                  />
                  <rect
                    x="838"
                    y="12"
                    width="110"
                    height="302"
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

                  <path
                    d="M 272 108 Q 335 104 398 112 T 560 110 T 828 112"
                    fill="none"
                    stroke="#618AA3"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x="420" y="98" fill="#A7BCC9" fontSize="11" fontFamily="var(--font-mono)">
                    Permukaan Laut
                  </text>
                  <path
                    d="M 262 178 L 360 178 L 440 236 L 828 236"
                    fill="none"
                    stroke="#618AA3"
                    strokeWidth="1.5"
                  />
                  <text x="448" y="254" fill="#A7BCC9" fontSize="11" fontFamily="var(--font-mono)">
                    Dasar Laut ({armourSpec.armourClassId})
                  </text>

                  <path
                    d={opticalPathD}
                    fill="none"
                    stroke="#35D0BA"
                    strokeWidth={signalVerified ? "4.5" : "3.5"}
                    strokeLinecap="round"
                  />

                  {isRopaMode && (
                    <path
                      d="M 196 138 L 288 138 L 352 170 L 456 214 L 472 214"
                      fill="none"
                      stroke="#47CD89"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  )}

                  {pulseKey > 0 && !shouldReduceMotion && (
                    <m.circle
                      key={`opt-pulse-${pulseKey}`}
                      r="5.5"
                      fill="#35D0BA"
                      initial={{ cx: 96, cy: 128, opacity: 1 }}
                      animate={{
                        cx:
                          isRepeateredMode || isRopaMode
                            ? [96, 288, 352, 456, 784, 856]
                            : [96, 288, 352, 456, 784, 856],
                        cy:
                          isRepeateredMode || isRopaMode
                            ? [128, 128, 162, 204, 204, 128]
                            : [128, 128, 162, 162, 162, 128],
                        opacity: [1, 1, 1, 1, 1, 0],
                      }}
                      transition={{ duration: 1.3, ease: "easeInOut" }}
                    />
                  )}

                  {modeSpec.dcPfeActive ? (
                    <>
                      <path
                        d="M 196 226 L 288 226 L 352 176 L 456 220 L 784 220 L 892 226"
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="2.5"
                        strokeDasharray="7 5"
                      />
                      <path
                        d="M 196 244 L 196 280 L 296 280"
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="1.8"
                        strokeDasharray="3 3"
                      />
                      <path
                        d="M 892 238 L 892 280 L 820 280"
                        fill="none"
                        stroke="#F5A623"
                        strokeWidth="1.8"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="130"
                        y="296"
                        fill="#F5A623"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        Sea Earth A (+V/2)
                      </text>
                      <text
                        x="788"
                        y="296"
                        fill="#F5A623"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        Sea Earth B (-V/2)
                      </text>
                    </>
                  ) : (
                    <g>
                      <rect
                        x="130"
                        y="264"
                        width="255"
                        height="28"
                        rx="4"
                        fill="#132F46"
                        stroke="#618AA3"
                      />
                      <text
                        x="142"
                        y="282"
                        fill="#EDF4F7"
                        fontSize="11"
                        fontFamily="var(--font-mono)"
                      >
                        Jalur Daya DC PFE: Tidak Aktif (0 V)
                      </text>
                    </g>
                  )}

                  <path
                    d="M 672 204 L 672 276 L 775 276"
                    fill="none"
                    stroke={activeNodeSet.has("bu") ? "#35D0BA" : "#618AA3"}
                    strokeWidth="2.5"
                    strokeDasharray={activeNodeSet.has("bu") ? undefined : "4 4"}
                  />
                  {modeSpec.dcPfeActive && (
                    <path
                      d="M 678 220 L 678 270 L 775 270"
                      fill="none"
                      stroke="#F5A623"
                      strokeWidth="1.8"
                      strokeDasharray="5 4"
                    />
                  )}
                  <text
                    x="604"
                    y="296"
                    fill={activeNodeSet.has("bu") ? "#EDF4F7" : "#A7BCC9"}
                    fontSize="11"
                    fontFamily="var(--font-sans)"
                  >
                    {activeNodeSet.has("bu")
                      ? "Cabang ke CLS C (Serat + DC)"
                      : "Cabang (Mode Trunk-Branch)"}
                  </text>

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
                            : "#618AA3"
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

                  {isRopaMode ? (
                    <g>
                      <rect
                        x="472"
                        y="174"
                        width="124"
                        height="60"
                        rx="6"
                        fill={selectedNodeId === "ropa" ? "#132F46" : "#0E2436"}
                        stroke="#35D0BA"
                        strokeWidth={selectedNodeId === "ropa" ? "2.5" : "1.5"}
                      />
                      <text
                        x="534"
                        y="200"
                        textAnchor="middle"
                        fill="#EDF4F7"
                        fontSize="12"
                        fontWeight="700"
                      >
                        ROPA Pasif
                      </text>
                      <text x="534" y="218" textAnchor="middle" fill="#A7BCC9" fontSize="10">
                        Pompa Optik 1480 nm
                      </text>
                    </g>
                  ) : (
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
                        stroke={selectedNodeId === "repeater" ? "#35D0BA" : "#618AA3"}
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
                  )}

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
                      stroke={selectedNodeId === "bu" ? "#35D0BA" : "#618AA3"}
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
                      {modeSpec.dcPfeActive ? "PFE (-V/2)" : "Tanpa PFE"}
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
                      className={cn(!activeInMode && !selected && "border-dashed")}
                    >
                      <span>{node.abbr}</span>
                      {!activeInMode && <span className="text-xs font-normal">(Nonaktif)</span>}
                    </Button>
                  );
                })}
              </div>
            </div>

            <p aria-live="polite" className="sr-only">
              {liveAnnouncement}
            </p>

            <div
              data-testid="explorer-inspector"
              className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-sedp-accent">
                    {selectedNode.zoneLabelId} |{" "}
                    {isSelectedActive
                      ? "Status: Aktif pada mode ini"
                      : "Status: Tidak dipakai pada mode ini"}
                  </p>
                  <SubHeading className="mt-1 font-display text-lg font-bold text-sedp-ink">
                    {selectedNode.abbr}: {selectedNode.labelId}
                  </SubHeading>
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
                    {selectedElectricalDetail}
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
              <SubHeading className="font-display text-base font-bold text-sedp-ink">
                Ringkasan Tabel Komponen (Sinkron dengan Diagram)
              </SubHeading>
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
