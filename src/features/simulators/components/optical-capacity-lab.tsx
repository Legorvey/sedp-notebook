"use client";

import { AlertCircle } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  calculateOpticalCapacity,
  DEFAULT_OPTICAL_CAPACITY_INPUT,
  OPTICAL_CAPACITY_LIMITS,
  OPTICAL_CAPACITY_PRESETS,
  type CapacityCalculationMode,
  type CapacityFieldName,
  type OpticalCapacityInput,
} from "@/features/simulators/engine/optical-capacity";
import { EducationalModellingDisclaimer } from "./educational-disclaimer";
import { NumericStepperField } from "./numeric-stepper-field";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

interface RawCapacityDraft {
  fiberPairs: string;
  spectrumPerPairTHz: string;
  spectralEfficiency: string;
  channelCount: string;
  channelRateGbps: string;
  channelSpacingGHz: string;
}

function inputToRawDraft(input: OpticalCapacityInput): RawCapacityDraft {
  return {
    fiberPairs: String(input.fiberPairs),
    spectrumPerPairTHz: String(input.spectrumPerPairTHz),
    spectralEfficiency: String(input.spectralEfficiency),
    channelCount: String(input.channelCount),
    channelRateGbps: String(input.channelRateGbps),
    channelSpacingGHz: String(input.channelSpacingGHz),
  };
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

function CapacityChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  return (
    <div className="rounded-md border border-[#618AA3] bg-[#0E2436] px-3 py-2 text-xs text-[#EDF4F7] shadow-md">
      <p className="font-mono font-semibold text-[#35D0BA]">Konfigurasi {label} FP</p>
      <ul className="mt-1 space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="font-mono">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : "0"} Tbps
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OpticalCapacityLab() {
  const [input, setInput] = useState<OpticalCapacityInput>(DEFAULT_OPTICAL_CAPACITY_INPUT);
  const [rawDraft, setRawDraft] = useState<RawCapacityDraft>(() =>
    inputToRawDraft(DEFAULT_OPTICAL_CAPACITY_INPUT)
  );
  const [liveStatus, setLiveStatus] = useState<string>(
    "Kalkulator Kapasitas Optik siap pada preset Sistem Pita-C (16 FP, 4,4 THz)."
  );

  const shouldReduceMotion = usePrefersReducedMotion();
  const baseId = useId();
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  const result = calculateOpticalCapacity(input);
  const errorMap = new Map<CapacityFieldName, string>(
    result.errors.map((err) => [err.field, err.messageId])
  );

  function applyPreset(presetId: string) {
    const preset = OPTICAL_CAPACITY_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setInput(preset.input);
    setRawDraft(inputToRawDraft(preset.input));
    const nextRes = calculateOpticalCapacity(preset.input);
    setLiveStatus(
      `Preset ${preset.labelId} diterapkan: ${nextRes.totalPerDirectionTbps.toFixed(1)} Tbps searah dan ${nextRes.bidirectionalAggregateTbps.toFixed(1)} Tbps agregat dua arah.`
    );
  }

  function handleModeSwitch(mode: CapacityCalculationMode) {
    const next = { ...input, mode };
    setInput(next);
    const nextRes = calculateOpticalCapacity(next);
    setLiveStatus(
      nextRes.valid
        ? `Mode diubah ke ${mode === "spectral" ? "Efisiensi Spektral" : "Kanal DWDM"}. Kapasitas total searah ${nextRes.totalPerDirectionTbps.toFixed(1)} Tbps.`
        : `Mode diubah ke ${mode === "spectral" ? "Efisiensi Spektral" : "Kanal DWDM"}. Terdapat parameter yang perlu disesuaikan.`
    );
  }

  function handleFieldUpdate(
    field: keyof RawCapacityDraft,
    nextNumber: number,
    nextRawText: string
  ) {
    const wasValid = result.valid;
    setRawDraft((prev) => ({ ...prev, [field]: nextRawText }));
    const nextInput = { ...input, [field]: nextNumber };
    setInput(nextInput);
    const nextRes = calculateOpticalCapacity(nextInput);
    if (!nextRes.valid && nextRes.errors[0]) {
      setLiveStatus(`Peringatan parameter: ${nextRes.errors[0].messageId}`);
    } else if (nextRes.valid && !wasValid) {
      setLiveStatus(
        `Parameter kembali valid: ${nextRes.totalPerDirectionTbps.toFixed(2)} Tbps searah (${nextRes.bidirectionalAggregateTbps.toFixed(2)} Tbps agregat).`
      );
    }
  }

  function handleReset(restoreFocusToTopButton = false) {
    setInput(DEFAULT_OPTICAL_CAPACITY_INPUT);
    setRawDraft(inputToRawDraft(DEFAULT_OPTICAL_CAPACITY_INPUT));
    setLiveStatus(
      `Parameter diatur ulang ke bawaan: 16 FP, 4,4 THz pita-C, efisiensi spektral 4,0 bit/s/Hz (281,6 Tbps searah).`
    );
    if (restoreFocusToTopButton) {
      requestAnimationFrame(() => resetButtonRef.current?.focus());
    }
  }

  return (
    <section
      aria-label="Simulator Kapasitas Optik Kabel Laut"
      className="abyss-bay rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-4 text-sedp-ink sm:p-6"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sedp-subtle-border pb-4">
          <div>
            <p className="font-mono text-xs font-medium text-sedp-accent">
              Lab (a) | Dekomposisi Wet Plant &amp; Dry Plant (Konvensi SI: 1 Tbps = 1000 Gbps)
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-sedp-ink sm:text-xl">
              {input.mode === "spectral"
                ? "Mode Efisiensi Spektral (B_THz x SE)"
                : "Mode Kanal DWDM (N_kanal x R_kanal)"}
            </h2>
            <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-sedp-muted">
              Setiap 1 Fiber Pair (FP) berisi 2 serat optik berlawanan arah (1 serat Tx dan 1 serat
              Rx). Pilih preset atau ubah parameter untuk melihat pemisahan antara kapasitas per
              arah dan agregat dua arah penuh.
            </p>
          </div>
          <Button
            ref={resetButtonRef}
            type="button"
            variant="outline"
            onClick={() => handleReset(false)}
          >
            Atur Ulang Parameter
          </Button>
        </div>

        <p aria-live="polite" className="sr-only">
          {liveStatus}
        </p>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="min-w-0 space-y-2 lg:col-span-7">
            <p className="text-xs font-semibold text-sedp-muted">
              1. Pilih Preset Referensi Edukatif
            </p>
            <div
              role="group"
              aria-label="Preset kalkulator kapasitas"
              className="flex flex-wrap gap-2"
            >
              {OPTICAL_CAPACITY_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant="outline"
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.labelId}
                </Button>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-2 lg:col-span-5">
            <p className="text-xs font-semibold text-sedp-muted">2. Pilih Metode Perhitungan</p>
            <div
              role="group"
              aria-label="Metode perhitungan kapasitas"
              className="flex flex-wrap gap-2"
            >
              <Button
                type="button"
                variant={input.mode === "spectral" ? "default" : "outline"}
                aria-pressed={input.mode === "spectral"}
                onClick={() => handleModeSwitch("spectral")}
              >
                Efisiensi Spektral
              </Button>
              <Button
                type="button"
                variant={input.mode === "channel" ? "default" : "outline"}
                aria-pressed={input.mode === "channel"}
                onClick={() => handleModeSwitch("channel")}
              >
                Jumlah Kanal DWDM
              </Button>
            </div>
          </div>
        </div>

        {!result.valid && (
          <div
            role="alert"
            className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-sedp-fault bg-sedp-inset p-4 text-sm text-sedp-ink"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-sedp-fault" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sedp-fault">
                  Terdapat parameter di luar batas fisik model
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-sedp-ink">
                  {result.errors.map((err) => (
                    <li key={err.field}>{err.messageId}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => handleReset(true)}>
              Atur Ulang Parameter
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-3 lg:col-span-5">
            <NumericStepperField
              id={`${baseId}-fp`}
              label="Jumlah Pasangan Serat (N_fp)"
              unit={OPTICAL_CAPACITY_LIMITS.fiberPairs.unit}
              value={input.fiberPairs}
              rawText={rawDraft.fiberPairs}
              min={OPTICAL_CAPACITY_LIMITS.fiberPairs.min}
              max={OPTICAL_CAPACITY_LIMITS.fiberPairs.max}
              step={OPTICAL_CAPACITY_LIMITS.fiberPairs.step}
              integer
              helperText="1 FP = 2 serat fisik (arah kirim Tx + arah terima Rx)."
              errorMessage={errorMap.get("fiberPairs")}
              onNumberChange={(num, raw) => handleFieldUpdate("fiberPairs", num, raw)}
            />

            <NumericStepperField
              id={`${baseId}-bw`}
              label="Lebar Spektrum per Serat (B_THz)"
              unit={OPTICAL_CAPACITY_LIMITS.spectrumPerPairTHz.unit}
              value={input.spectrumPerPairTHz}
              rawText={rawDraft.spectrumPerPairTHz}
              min={OPTICAL_CAPACITY_LIMITS.spectrumPerPairTHz.min}
              max={OPTICAL_CAPACITY_LIMITS.spectrumPerPairTHz.max}
              step={OPTICAL_CAPACITY_LIMITS.spectrumPerPairTHz.step}
              helperText="Pita-C umum ~4,4 THz; pita ganda C+L ~8,8 THz."
              errorMessage={errorMap.get("spectrumPerPairTHz")}
              onNumberChange={(num, raw) => handleFieldUpdate("spectrumPerPairTHz", num, raw)}
            />

            {input.mode === "spectral" ? (
              <NumericStepperField
                id={`${baseId}-se`}
                label="Efisiensi Spektral SLTE (SE)"
                unit={OPTICAL_CAPACITY_LIMITS.spectralEfficiency.unit}
                value={input.spectralEfficiency}
                rawText={rawDraft.spectralEfficiency}
                min={OPTICAL_CAPACITY_LIMITS.spectralEfficiency.min}
                max={OPTICAL_CAPACITY_LIMITS.spectralEfficiency.max}
                step={OPTICAL_CAPACITY_LIMITS.spectralEfficiency.step}
                helperText="Efisiensi modulasi koheren bersih pasca-FEC pada lintasan tersebut."
                errorMessage={errorMap.get("spectralEfficiency")}
                onNumberChange={(num, raw) => handleFieldUpdate("spectralEfficiency", num, raw)}
              />
            ) : (
              <>
                <NumericStepperField
                  id={`${baseId}-nlambda`}
                  label="Jumlah Kanal Aktif (N_lambda)"
                  unit={OPTICAL_CAPACITY_LIMITS.channelCount.unit}
                  value={input.channelCount}
                  rawText={rawDraft.channelCount}
                  min={OPTICAL_CAPACITY_LIMITS.channelCount.min}
                  max={OPTICAL_CAPACITY_LIMITS.channelCount.max}
                  step={OPTICAL_CAPACITY_LIMITS.channelCount.step}
                  integer
                  helperText={
                    result.maxSlotsPerPair !== null
                      ? `Kapasitas slot tersedia pada pita saat ini: maksimum ${result.maxSlotsPerPair} slot.`
                      : undefined
                  }
                  errorMessage={errorMap.get("channelCount")}
                  onNumberChange={(num, raw) => handleFieldUpdate("channelCount", num, raw)}
                />

                <NumericStepperField
                  id={`${baseId}-rlambda`}
                  label="Laju per Kanal (R_lambda)"
                  unit={OPTICAL_CAPACITY_LIMITS.channelRateGbps.unit}
                  value={input.channelRateGbps}
                  rawText={rawDraft.channelRateGbps}
                  min={OPTICAL_CAPACITY_LIMITS.channelRateGbps.min}
                  max={OPTICAL_CAPACITY_LIMITS.channelRateGbps.max}
                  step={OPTICAL_CAPACITY_LIMITS.channelRateGbps.step}
                  helperText="Laju bit bersih per panjang gelombang transponder (mis. 100, 400, 800 Gbps)."
                  errorMessage={errorMap.get("channelRateGbps")}
                  onNumberChange={(num, raw) => handleFieldUpdate("channelRateGbps", num, raw)}
                />

                <NumericStepperField
                  id={`${baseId}-spacing`}
                  label="Spasi Antar-Kanal (Delta_f)"
                  unit={OPTICAL_CAPACITY_LIMITS.channelSpacingGHz.unit}
                  value={input.channelSpacingGHz}
                  rawText={rawDraft.channelSpacingGHz}
                  min={OPTICAL_CAPACITY_LIMITS.channelSpacingGHz.min}
                  max={OPTICAL_CAPACITY_LIMITS.channelSpacingGHz.max}
                  step={OPTICAL_CAPACITY_LIMITS.channelSpacingGHz.step}
                  helperText="Spasi frekuensi grid DWDM (mis. 37,5 GHz, 50 GHz, atau 75 GHz)."
                  errorMessage={errorMap.get("channelSpacingGHz")}
                  onNumberChange={(num, raw) => handleFieldUpdate("channelSpacingGHz", num, raw)}
                />
              </>
            )}
          </div>

          <div className="min-w-0 space-y-4 lg:col-span-7">
            <div data-testid="capacity-readouts" className="grid gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  Kapasitas per Fiber Pair (Searah)
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-sedp-accent tabular-nums">
                  {result.valid ? `${result.perPairPerDirectionTbps.toFixed(2)} Tbps` : "--"}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  Laju A ke B pada 1 serat Tx (serat pasangannya membawa arah sebaliknya).
                </p>
              </div>

              <div className="min-w-0 rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">Total Kapasitas Searah</p>
                <p className="mt-1 font-mono text-2xl font-bold text-sedp-ink tabular-nums">
                  {result.valid ? `${result.totalPerDirectionTbps.toFixed(2)} Tbps` : "--"}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  {result.valid
                    ? `Diperoleh dari ${result.fiberPairs} FP x kapasitas searah per FP.`
                    : "Menunggu seluruh parameter valid."}
                </p>
              </div>

              <div className="min-w-0 rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  Agregat Dua Arah (Full Duplex)
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-sedp-partial tabular-nums">
                  {result.valid ? `${result.bidirectionalAggregateTbps.toFixed(2)} Tbps` : "--"}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  {result.valid
                    ? `Total dua arah lintas ${result.totalFibers} serat fisik (2 x kapasitas searah).`
                    : "Total dua arah menunggu input valid."}
                </p>
              </div>

              <div className="min-w-0 rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  {input.mode === "spectral"
                    ? "Lebar Spektrum & Efisiensi"
                    : "Okupansi Spektrum & SE Efektif"}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-sedp-ink tabular-nums">
                  {result.valid
                    ? input.mode === "spectral"
                      ? `${result.effectiveBandSE.toFixed(2)} bit/s/Hz`
                      : `${result.spectrumOccupancyPct.toFixed(1)}%`
                    : "--"}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  {!result.valid
                    ? "Spektrum usable: --"
                    : result.maxSlotsPerPair !== null
                      ? `SE efektif ${result.effectiveBandSE.toFixed(2)} bit/s/Hz; ${result.occupiedSpectrumGHz.toFixed(1)} dari ${(result.spectrumPerPairTHz * 1000).toFixed(0)} GHz terisi (maks ${result.maxSlotsPerPair} slot).`
                      : `${(result.spectrumPerPairTHz * 1000).toFixed(0)} GHz spektrum usable per serat (${result.spectrumOccupancyPct.toFixed(1)}% penuh).`}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
              <h3 className="font-display text-base font-bold text-sedp-ink">
                Bagaimana Kapasitas Searah dan Agregat Dua Arah Meningkat Seiring Jumlah Fiber Pair?
              </h3>
              <p className="mt-1 text-xs text-sedp-muted">
                Perbandingan linier ideal pada konfigurasi spektrum dan modulasi saat ini:{" "}
                {result.valid ? result.totalCapacityApproxLabel : "perbaiki parameter"}.
              </p>

              <div aria-hidden="true" className="mt-3 h-[260px] w-full min-w-0">
                {result.valid && result.scalingSeries.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 200, height: 260 }}
                  >
                    <BarChart
                      accessibilityLayer={false}
                      data={result.scalingSeries as unknown as Record<string, unknown>[]}
                      margin={{ top: 10, right: 12, left: 6, bottom: 16 }}
                    >
                      <CartesianGrid stroke="#1F3B52" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="fiberPairs"
                        stroke="#A7BCC9"
                        tick={{ fill: "#A7BCC9", fontSize: 12 }}
                        label={{
                          value: "Jumlah Pasangan Serat (FP)",
                          position: "insideBottom",
                          offset: -6,
                          fill: "#A7BCC9",
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        stroke="#A7BCC9"
                        tick={{ fill: "#A7BCC9", fontSize: 12 }}
                        label={{
                          value: "Kapasitas (Tbps)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#A7BCC9",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip content={<CapacityChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />
                      <Bar
                        dataKey="totalPerDirectionTbps"
                        name="Total Searah (Tbps)"
                        fill="#35D0BA"
                        isAnimationActive={!shouldReduceMotion}
                      />
                      <Bar
                        dataKey="bidirectionalAggregateTbps"
                        name="Agregat 2 Arah (Tbps)"
                        fill="#F5A623"
                        isAnimationActive={!shouldReduceMotion}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed border-sedp-control-border bg-sedp-inset p-4 text-center text-xs text-sedp-muted">
                    Grafik penskalaan ditahan karena ada parameter di luar rentang model.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-sedp-subtle-border bg-sedp-inset p-4">
                <h3 className="font-display text-sm font-bold text-sedp-ink">
                  Apa yang Berubah &amp; Mengapa?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-sedp-ink">
                  {result.causalSummaryId}
                </p>
              </div>
              <div className="rounded-md border border-sedp-subtle-border bg-sedp-inset p-4">
                <h3 className="font-display text-sm font-bold text-sedp-ink">
                  Model Ideal vs Kendala Sistem Nyata
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-sedp-muted">
                  {result.idealizedVsRealNoteId}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-base font-bold text-sedp-ink">
            Tabel Rincian Skala Fiber Pair (Sinkron dengan Grafik)
          </h3>
          <p className="text-xs leading-relaxed text-sedp-muted">{result.assumptionsNoteId}</p>
          <p className="text-xs text-sedp-muted sm:hidden">
            Geser tabel ke samping untuk melihat seluruh kolom kapasitas per arah dan agregat.
          </p>
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel rincian skala kapasitas fiber pair"
            className="overflow-x-auto rounded-md border border-sedp-control-border bg-sedp-surface"
          >
            <table className="w-full min-w-[640px] border-collapse text-left text-xs sm:text-sm">
              <caption className="sr-only">
                Rincian skala kapasitas fiber pair. {result.assumptionsNoteId}
              </caption>
              <thead>
                <tr className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Pasangan Serat (FP)
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Total Serat Fisik
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Per FP Searah (Tbps)
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Total Searah (Tbps)
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Agregat 2 Arah (Tbps)
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.scalingSeries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-sedp-muted">
                      Tidak ada baris yang dapat dihitung selama parameter tidak valid.
                    </td>
                  </tr>
                ) : (
                  result.scalingSeries.map((row) => (
                    <tr
                      key={row.fiberPairs}
                      className={
                        row.isSelected
                          ? "border-b border-sedp-subtle-border bg-sedp-inset font-semibold"
                          : "border-b border-sedp-subtle-border last:border-b-0"
                      }
                    >
                      <th scope="row" className="px-3 py-2.5 font-mono text-sedp-accent">
                        {row.fiberPairs} FP {row.isSelected ? "(Aktif)" : ""}
                      </th>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {row.totalFibers} serat
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {row.perPairPerDirectionTbps.toFixed(3)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {row.totalPerDirectionTbps.toFixed(3)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {row.bidirectionalAggregateTbps.toFixed(3)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <EducationalModellingDisclaimer />
      </div>
    </section>
  );
}
