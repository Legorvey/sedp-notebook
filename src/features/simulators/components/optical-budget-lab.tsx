"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  calculateOpticalBudget,
  DEFAULT_REPEATERED_BUDGET_INPUT,
  DEFAULT_REPEATERLESS_BUDGET_INPUT,
  OPTICAL_BUDGET_LIMITS,
  OPTICAL_BUDGET_PRESETS,
  type BudgetArchitecture,
  type BudgetFieldName,
  type OpticalBudgetInput,
  type PowerInputMode,
} from "@/features/simulators/engine/optical-budget";
import { EducationalModellingDisclaimer } from "./educational-disclaimer";
import { NumericStepperField } from "./numeric-stepper-field";

interface RawBudgetDraft {
  distanceKm: string;
  attenuationDbPerKm: string;
  launchPowerPerChannelDbm: string;
  totalEdfaPowerDbm: string;
  channelCount: string;
  terminalConnectorLossDb: string;
  extraSpanLossDb: string;
  repairMarginDb: string;
  agingMarginDb: string;
  ramanRopaGainDb: string;
  repeaterSpacingKm: string;
  noiseFigureDb: string;
  targetOsnrDb: string;
}

function inputToRawDraft(input: OpticalBudgetInput): RawBudgetDraft {
  return {
    distanceKm: String(input.distanceKm),
    attenuationDbPerKm: String(input.attenuationDbPerKm),
    launchPowerPerChannelDbm: String(input.launchPowerPerChannelDbm),
    totalEdfaPowerDbm: String(input.totalEdfaPowerDbm),
    channelCount: String(input.channelCount),
    terminalConnectorLossDb: String(input.terminalConnectorLossDb),
    extraSpanLossDb: String(input.extraSpanLossDb),
    repairMarginDb: String(input.repairMarginDb),
    agingMarginDb: String(input.agingMarginDb),
    ramanRopaGainDb: String(input.ramanRopaGainDb),
    repeaterSpacingKm: String(input.repeaterSpacingKm),
    noiseFigureDb: String(input.noiseFigureDb),
    targetOsnrDb: String(input.targetOsnrDb),
  };
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
}

function BudgetChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  return (
    <div className="rounded-md border border-[#618AA3] bg-[#0E2436] px-3 py-2 text-xs text-[#EDF4F7] shadow-md">
      <p className="font-mono font-semibold text-[#35D0BA]">{label}</p>
      <ul className="mt-1 space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="font-mono">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : "0"} {unit}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OpticalBudgetLab() {
  const [input, setInput] = useState<OpticalBudgetInput>(DEFAULT_REPEATERED_BUDGET_INPUT);
  const [rawDraft, setRawDraft] = useState<RawBudgetDraft>(() =>
    inputToRawDraft(DEFAULT_REPEATERED_BUDGET_INPUT)
  );
  const [liveStatus, setLiveStatus] = useState<string>(
    "Simulator Anggaran Daya aktif pada mode Sistem Ber-Repeater EDFA (6.000 km)."
  );

  const shouldReduceMotion = useReducedMotion();
  const baseId = useId();

  const result = calculateOpticalBudget(input);
  const errorMap = new Map<BudgetFieldName, string>(
    result.errors.map((err) => [err.field, err.messageId])
  );

  function applyPreset(presetId: string) {
    const preset = OPTICAL_BUDGET_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setInput(preset.input);
    setRawDraft(inputToRawDraft(preset.input));
    const nextRes = calculateOpticalBudget(preset.input);
    setLiveStatus(`Preset ${preset.labelId} dimuat. ${nextRes.statusLabelId}.`);
  }

  function switchArchitecture(arch: BudgetArchitecture) {
    const base =
      arch === "repeatered" ? DEFAULT_REPEATERED_BUDGET_INPUT : DEFAULT_REPEATERLESS_BUDGET_INPUT;
    const next: OpticalBudgetInput = {
      ...base,
      powerInputMode: input.powerInputMode,
    };
    setInput(next);
    setRawDraft(inputToRawDraft(next));
    const nextRes = calculateOpticalBudget(next);
    setLiveStatus(
      `Arsitektur diubah ke ${arch === "repeatered" ? "Ber-Repeater EDFA" : "Repeaterless"}. ${nextRes.statusLabelId}.`
    );
  }

  function switchPowerMode(mode: PowerInputMode) {
    const next = { ...input, powerInputMode: mode };
    setInput(next);
    setLiveStatus(
      `Mode input daya diubah ke ${mode === "per-channel" ? "Daya Per-Kanal (dBm)" : "Total Daya EDFA dibagi N_kanal"}.`
    );
  }

  function updateField(field: keyof RawBudgetDraft, nextNumber: number, nextRawText: string) {
    setRawDraft((prev) => ({ ...prev, [field]: nextRawText }));
    const nextInput = { ...input, [field]: nextNumber };
    setInput(nextInput);
    const nextRes = calculateOpticalBudget(nextInput);
    if (!nextRes.valid && nextRes.errors[0]) {
      setLiveStatus(`Peringatan parameter: ${nextRes.errors[0].messageId}`);
    }
  }

  function handleReset() {
    const resetTarget =
      input.architecture === "repeatered"
        ? DEFAULT_REPEATERED_BUDGET_INPUT
        : DEFAULT_REPEATERLESS_BUDGET_INPUT;
    setInput(resetTarget);
    setRawDraft(inputToRawDraft(resetTarget));
    setLiveStatus("Parameter anggaran daya dikembalikan ke nilai acuan awal.");
  }

  const isRepeatered = input.architecture === "repeatered";
  const chartUnit = isRepeatered ? "dB" : "dBm";
  const referenceLineValue = isRepeatered ? input.targetOsnrDb : result.illustrativeRxThresholdDbm;

  return (
    <section
      aria-label="Simulator Redaman dan Anggaran Daya Optik"
      className="abyss-bay rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-4 text-sedp-ink sm:p-6"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sedp-subtle-border pb-4">
          <div>
            <p className="font-mono text-xs font-medium text-sedp-accent">
              Lab (b) | Pemodelan Anggaran Daya BOL vs EOL (~25 Tahun)
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-sedp-ink sm:text-xl">
              {isRepeatered
                ? "Sistem Ber-Repeater EDFA: Akumulasi Derau ASE (OSNR)"
                : "Sistem Repeaterless: Penurunan Daya Eksponensial & Anggaran Total"}
            </h2>
            <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-sedp-muted">
              Pelajari perbedaan <span className="font-mono text-sedp-ink">dBm</span> (daya absolut
              terhadap 1 mW) vs <span className="font-mono text-sedp-ink">dB</span> (selisih/rasio
              rugi), margin perbaikan &amp; penuaan (BOL vs EOL), dan batas rumus linier.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={handleReset}>
            Atur Ulang Parameter
          </Button>
        </div>

        <p aria-live="polite" className="sr-only">
          {liveStatus}
        </p>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-5">
            <p className="text-xs font-semibold text-sedp-muted">1. Pilih Arsitektur Jalur Laut</p>
            <div
              role="group"
              aria-label="Pilih arsitektur anggaran daya"
              className="flex flex-wrap gap-2"
            >
              <Button
                type="button"
                variant={isRepeatered ? "default" : "outline"}
                aria-pressed={isRepeatered}
                onClick={() => switchArchitecture("repeatered")}
              >
                Ber-Repeater EDFA
              </Button>
              <Button
                type="button"
                variant={!isRepeatered ? "default" : "outline"}
                aria-pressed={!isRepeatered}
                onClick={() => switchArchitecture("repeaterless")}
              >
                Repeaterless
              </Button>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-7">
            <p className="text-xs font-semibold text-sedp-muted">
              2. Preset Skenario Terverifikasi
            </p>
            <div
              role="group"
              aria-label="Pilih preset skenario anggaran daya"
              className="flex flex-wrap gap-2"
            >
              {OPTICAL_BUDGET_PRESETS.map((preset) => (
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
                  Input berada di luar rentang fisika model
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-sedp-ink">
                  {result.errors.map((err) => (
                    <li key={err.field}>{err.messageId}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={handleReset}>
              Atur Ulang Parameter
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-md border border-sedp-subtle-border bg-sedp-surface p-3.5">
              <p className="text-xs font-semibold text-sedp-muted">
                Cara Menentukan Daya Luncur Optik
              </p>
              <div
                role="group"
                aria-label="Pilih mode input daya luncur"
                className="mt-2 flex flex-wrap gap-2"
              >
                <Button
                  type="button"
                  variant={input.powerInputMode === "per-channel" ? "default" : "outline"}
                  aria-pressed={input.powerInputMode === "per-channel"}
                  onClick={() => switchPowerMode("per-channel")}
                >
                  Per-Kanal (P_ch)
                </Button>
                <Button
                  type="button"
                  variant={input.powerInputMode === "total-edfa" ? "default" : "outline"}
                  aria-pressed={input.powerInputMode === "total-edfa"}
                  onClick={() => switchPowerMode("total-edfa")}
                >
                  Total EDFA (P_total)
                </Button>
              </div>
            </div>

            {input.powerInputMode === "per-channel" ? (
              <NumericStepperField
                id={`${baseId}-pch`}
                label="Daya Luncur per Kanal (P_ch)"
                unit={OPTICAL_BUDGET_LIMITS.launchPowerPerChannelDbm.unit}
                value={input.launchPowerPerChannelDbm}
                rawText={rawDraft.launchPowerPerChannelDbm}
                min={OPTICAL_BUDGET_LIMITS.launchPowerPerChannelDbm.min}
                max={OPTICAL_BUDGET_LIMITS.launchPowerPerChannelDbm.max}
                step={OPTICAL_BUDGET_LIMITS.launchPowerPerChannelDbm.step}
                helperText="Daya absolut tiap panjang gelombang yang masuk ke span laut."
                errorMessage={errorMap.get("launchPowerPerChannelDbm")}
                onNumberChange={(num, raw) => updateField("launchPowerPerChannelDbm", num, raw)}
              />
            ) : (
              <>
                <NumericStepperField
                  id={`${baseId}-ptot`}
                  label="Daya Keluaran Total Penguat (P_total)"
                  unit={OPTICAL_BUDGET_LIMITS.totalEdfaPowerDbm.unit}
                  value={input.totalEdfaPowerDbm}
                  rawText={rawDraft.totalEdfaPowerDbm}
                  min={OPTICAL_BUDGET_LIMITS.totalEdfaPowerDbm.min}
                  max={OPTICAL_BUDGET_LIMITS.totalEdfaPowerDbm.max}
                  step={OPTICAL_BUDGET_LIMITS.totalEdfaPowerDbm.step}
                  helperText="Daya total penguat dibagi rata ke N_lambda kanal (P_total - 10 log10 N)."
                  errorMessage={errorMap.get("totalEdfaPowerDbm")}
                  onNumberChange={(num, raw) => updateField("totalEdfaPowerDbm", num, raw)}
                />
                <NumericStepperField
                  id={`${baseId}-nch`}
                  label="Jumlah Kanal Aktif (N_lambda)"
                  unit={OPTICAL_BUDGET_LIMITS.channelCount.unit}
                  value={input.channelCount}
                  rawText={rawDraft.channelCount}
                  min={OPTICAL_BUDGET_LIMITS.channelCount.min}
                  max={OPTICAL_BUDGET_LIMITS.channelCount.max}
                  step={OPTICAL_BUDGET_LIMITS.channelCount.step}
                  integer
                  helperText={
                    result.valid
                      ? `Daya efektif terhitung: ${result.effectiveLaunchPowerPerChannelDbm.toFixed(2)} dBm/kanal.`
                      : undefined
                  }
                  errorMessage={errorMap.get("channelCount")}
                  onNumberChange={(num, raw) => updateField("channelCount", num, raw)}
                />
              </>
            )}

            <NumericStepperField
              id={`${baseId}-dist`}
              label="Panjang Rute Kabel Laut (L)"
              unit={OPTICAL_BUDGET_LIMITS.distanceKm.unit}
              value={input.distanceKm}
              rawText={rawDraft.distanceKm}
              min={OPTICAL_BUDGET_LIMITS.distanceKm.min}
              max={OPTICAL_BUDGET_LIMITS.distanceKm.max}
              step={OPTICAL_BUDGET_LIMITS.distanceKm.step}
              helperText="Coba jarak jauh di mode Repeaterless untuk melihat fraksi < 1e-30."
              errorMessage={errorMap.get("distanceKm")}
              onNumberChange={(num, raw) => updateField("distanceKm", num, raw)}
            />

            <NumericStepperField
              id={`${baseId}-alpha`}
              label="Koefisien Redaman Serat (alpha)"
              unit={OPTICAL_BUDGET_LIMITS.attenuationDbPerKm.unit}
              value={input.attenuationDbPerKm}
              rawText={rawDraft.attenuationDbPerKm}
              min={OPTICAL_BUDGET_LIMITS.attenuationDbPerKm.min}
              max={OPTICAL_BUDGET_LIMITS.attenuationDbPerKm.max}
              step={OPTICAL_BUDGET_LIMITS.attenuationDbPerKm.step}
              helperText="Serat ultra-low-loss umumnya ~0,15 - 0,18 dB/km; preset latihan 0,20 dB/km."
              errorMessage={errorMap.get("attenuationDbPerKm")}
              onNumberChange={(num, raw) => updateField("attenuationDbPerKm", num, raw)}
            />

            {isRepeatered ? (
              <>
                <NumericStepperField
                  id={`${baseId}-lrep`}
                  label="Jarak Antar-Repeater (L_rep)"
                  unit={OPTICAL_BUDGET_LIMITS.repeaterSpacingKm.unit}
                  value={input.repeaterSpacingKm}
                  rawText={rawDraft.repeaterSpacingKm}
                  min={OPTICAL_BUDGET_LIMITS.repeaterSpacingKm.min}
                  max={OPTICAL_BUDGET_LIMITS.repeaterSpacingKm.max}
                  step={OPTICAL_BUDGET_LIMITS.repeaterSpacingKm.step}
                  errorMessage={errorMap.get("repeaterSpacingKm")}
                  onNumberChange={(num, raw) => updateField("repeaterSpacingKm", num, raw)}
                />
                <NumericStepperField
                  id={`${baseId}-nf`}
                  label="Noise Figure EDFA (NF)"
                  unit={OPTICAL_BUDGET_LIMITS.noiseFigureDb.unit}
                  value={input.noiseFigureDb}
                  rawText={rawDraft.noiseFigureDb}
                  min={OPTICAL_BUDGET_LIMITS.noiseFigureDb.min}
                  max={OPTICAL_BUDGET_LIMITS.noiseFigureDb.max}
                  step={OPTICAL_BUDGET_LIMITS.noiseFigureDb.step}
                  errorMessage={errorMap.get("noiseFigureDb")}
                  onNumberChange={(num, raw) => updateField("noiseFigureDb", num, raw)}
                />
                <NumericStepperField
                  id={`${baseId}-target-osnr`}
                  label="Ambang Ilustrasi OSNR ASE"
                  unit={OPTICAL_BUDGET_LIMITS.targetOsnrDb.unit}
                  value={input.targetOsnrDb}
                  rawText={rawDraft.targetOsnrDb}
                  min={OPTICAL_BUDGET_LIMITS.targetOsnrDb.min}
                  max={OPTICAL_BUDGET_LIMITS.targetOsnrDb.max}
                  step={OPTICAL_BUDGET_LIMITS.targetOsnrDb.step}
                  errorMessage={errorMap.get("targetOsnrDb")}
                  onNumberChange={(num, raw) => updateField("targetOsnrDb", num, raw)}
                />
              </>
            ) : (
              <>
                <NumericStepperField
                  id={`${baseId}-term`}
                  label="Rugi Konektor & Terminal (A_term)"
                  unit={OPTICAL_BUDGET_LIMITS.terminalConnectorLossDb.unit}
                  value={input.terminalConnectorLossDb}
                  rawText={rawDraft.terminalConnectorLossDb}
                  min={OPTICAL_BUDGET_LIMITS.terminalConnectorLossDb.min}
                  max={OPTICAL_BUDGET_LIMITS.terminalConnectorLossDb.max}
                  step={OPTICAL_BUDGET_LIMITS.terminalConnectorLossDb.step}
                  errorMessage={errorMap.get("terminalConnectorLossDb")}
                  onNumberChange={(num, raw) => updateField("terminalConnectorLossDb", num, raw)}
                />
                <NumericStepperField
                  id={`${baseId}-raman`}
                  label="Penguatan Optik Raman / ROPA"
                  unit={OPTICAL_BUDGET_LIMITS.ramanRopaGainDb.unit}
                  value={input.ramanRopaGainDb}
                  rawText={rawDraft.ramanRopaGainDb}
                  min={OPTICAL_BUDGET_LIMITS.ramanRopaGainDb.min}
                  max={OPTICAL_BUDGET_LIMITS.ramanRopaGainDb.max}
                  step={OPTICAL_BUDGET_LIMITS.ramanRopaGainDb.step}
                  helperText="Batas pemodelan edukatif penguatan pompa darat (0 - 30 dB)."
                  errorMessage={errorMap.get("ramanRopaGainDb")}
                  onNumberChange={(num, raw) => updateField("ramanRopaGainDb", num, raw)}
                />
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <NumericStepperField
                id={`${baseId}-mrep`}
                label="Margin Perbaikan"
                unit={OPTICAL_BUDGET_LIMITS.repairMarginDb.unit}
                value={input.repairMarginDb}
                rawText={rawDraft.repairMarginDb}
                min={OPTICAL_BUDGET_LIMITS.repairMarginDb.min}
                max={OPTICAL_BUDGET_LIMITS.repairMarginDb.max}
                step={OPTICAL_BUDGET_LIMITS.repairMarginDb.step}
                errorMessage={errorMap.get("repairMarginDb")}
                onNumberChange={(num, raw) => updateField("repairMarginDb", num, raw)}
              />
              <NumericStepperField
                id={`${baseId}-mage`}
                label="Margin Penuaan"
                unit={OPTICAL_BUDGET_LIMITS.agingMarginDb.unit}
                value={input.agingMarginDb}
                rawText={rawDraft.agingMarginDb}
                min={OPTICAL_BUDGET_LIMITS.agingMarginDb.min}
                max={OPTICAL_BUDGET_LIMITS.agingMarginDb.max}
                step={OPTICAL_BUDGET_LIMITS.agingMarginDb.step}
                errorMessage={errorMap.get("agingMarginDb")}
                onNumberChange={(num, raw) => updateField("agingMarginDb", num, raw)}
              />
            </div>
          </div>

          <div className="space-y-4 lg:col-span-7">
            <div
              className={
                result.valid && result.meetsTarget
                  ? "flex items-start gap-2.5 rounded-md border border-sedp-verified bg-sedp-inset p-3.5 text-xs font-semibold text-sedp-verified sm:text-sm"
                  : "flex items-start gap-2.5 rounded-md border border-sedp-fault bg-sedp-inset p-3.5 text-xs font-semibold text-sedp-fault sm:text-sm"
              }
            >
              {result.valid && result.meetsTarget ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              )}
              <span>{result.statusLabelId}</span>
            </div>

            <div data-testid="budget-readouts" className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  Redaman Serat Pasif Total (A_serat)
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-sedp-ink tabular-nums">
                  {result.valid ? `${result.fiberAttenuationDb.toFixed(2)} dB` : "--"}
                </p>
                <p className="mt-1 font-mono text-xs text-sedp-accent">
                  Fraksi linier: {result.linearPowerFractionLabel}
                </p>
              </div>

              <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  {isRepeatered ? "Struktur Span EDFA" : "Total Rugi Ujung-ke-Ujung (EOL)"}
                </p>
                <p className="mt-1 font-mono text-xl font-bold text-sedp-ink tabular-nums">
                  {!result.valid
                    ? "--"
                    : isRepeatered
                      ? `${result.spanCount} span (${result.spanLossDb?.toFixed(2)} dB/span)`
                      : `${result.eolTotalLossDb?.toFixed(2)} dB (BOL ${result.bolTotalLossDb?.toFixed(2)} dB)`}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  Daya luncur efektif: {result.effectiveLaunchPowerPerChannelDbm.toFixed(2)}{" "}
                  dBm/kanal
                </p>
              </div>

              <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  {isRepeatered ? "BOL OSNR ASE (0,1 nm)" : "Daya Terima Awal (BOL)"}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-sedp-accent tabular-nums">
                  {!result.valid
                    ? "--"
                    : isRepeatered
                      ? `${result.bolOsnrDb?.toFixed(2)} dB`
                      : `${result.bolRxPowerDbm?.toFixed(2)} dBm`}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  Kondisi awal operasi sebelum penuaan komponen atau tambahan sambungan perbaikan.
                </p>
              </div>

              <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
                <p className="text-xs font-semibold text-sedp-muted">
                  {isRepeatered ? "EOL OSNR ASE (~25 Tahun)" : "Daya Terima Akhir (EOL)"}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#F5A623] tabular-nums">
                  {!result.valid
                    ? "--"
                    : isRepeatered
                      ? `${result.eolOsnrDb?.toFixed(2)} dB`
                      : `${result.eolRxPowerDbm?.toFixed(2)} dBm`}
                </p>
                <p className="mt-1 text-xs text-sedp-muted">
                  Dikurangi margin perbaikan ({input.repairMarginDb.toFixed(1)} dB) &amp; penuaan (
                  {input.agingMarginDb.toFixed(1)} dB).
                </p>
              </div>
            </div>

            {result.nonlinearWarningId && (
              <div
                role="note"
                className="flex items-start gap-2.5 rounded-md border border-sedp-partial bg-sedp-inset p-3.5 text-xs leading-relaxed text-sedp-ink"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-sedp-partial"
                  aria-hidden="true"
                />
                <p>{result.nonlinearWarningId}</p>
              </div>
            )}

            <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-4">
              <h3 className="font-display text-base font-bold text-sedp-ink">
                {isRepeatered
                  ? "Bagaimana Akumulasi Span Menurunkan OSNR ASE dari BOL hingga EOL?"
                  : "Bagaimana Daya Optik Turun dari Awal (BOL) ke Akhir Masa Pakai (EOL) Sepanjang Rute?"}
              </h3>
              <p className="mt-1 text-xs text-sedp-muted">
                Kurva BOL vs EOL dibandingkan dengan garis ambang ilustrasi (
                {referenceLineValue.toFixed(1)} {chartUnit}).
              </p>

              <div className="mt-3 h-[260px] w-full">
                {result.valid && result.profileSeries.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    initialDimension={{ width: 580, height: 260 }}
                  >
                    <LineChart
                      data={result.profileSeries as unknown as Record<string, unknown>[]}
                      margin={{ top: 10, right: 16, left: 4, bottom: 8 }}
                    >
                      <CartesianGrid stroke="#1F3B52" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="stepLabel"
                        stroke="#A7BCC9"
                        tick={{ fill: "#A7BCC9", fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#A7BCC9"
                        tick={{ fill: "#A7BCC9", fontSize: 12 }}
                        label={{
                          value: isRepeatered ? "OSNR ASE (dB)" : "Daya Terima (dBm)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#A7BCC9",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip content={<BudgetChartTooltip unit={chartUnit} />} />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                      <ReferenceLine
                        y={referenceLineValue}
                        stroke="#F97066"
                        strokeDasharray="5 4"
                        label={{
                          value: `Ambang Ilustrasi (${referenceLineValue} ${chartUnit})`,
                          fill: "#F97066",
                          fontSize: 11,
                          position: "insideTopRight",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bolValue"
                        name={isRepeatered ? "BOL OSNR ASE (dB)" : "Daya Terima BOL (dBm)"}
                        stroke="#35D0BA"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        isAnimationActive={!shouldReduceMotion}
                      />
                      <Line
                        type="monotone"
                        dataKey="eolValue"
                        name={isRepeatered ? "EOL OSNR ASE (dB)" : "Daya Terima EOL (dBm)"}
                        stroke="#F5A623"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        isAnimationActive={!shouldReduceMotion}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed border-sedp-control-border bg-sedp-inset p-4 text-center text-xs text-sedp-muted">
                    Grafik profil ditahan hingga seluruh parameter berada dalam rentang valid.
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
                  {result.causalExplanationId}
                </p>
              </div>
              <div className="rounded-md border border-sedp-control-border bg-sedp-inset p-4">
                <h3 className="font-display text-sm font-bold text-sedp-partial">
                  Batas Pendekatan: OSNR ASE vs GSNR Nyata
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-sedp-ink">
                  {result.limitationsNoteId}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-base font-bold text-sedp-ink">
            Tabel Profil Titik Demi Titik (Sinkron dengan Grafik)
          </h3>
          <p className="text-xs text-sedp-muted sm:hidden">
            Geser tabel ke samping untuk memeriksa nilai BOL, EOL, dan selisih ambang ilustrasi.
          </p>
          <div
            tabIndex={0}
            role="region"
            aria-label="Tabel profil anggaran daya dan OSNR"
            className="overflow-x-auto rounded-md border border-sedp-control-border bg-sedp-surface"
          >
            <table className="w-full min-w-[660px] border-collapse text-left text-xs sm:text-sm">
              <caption className="border-b border-sedp-subtle-border bg-sedp-inset px-4 py-2.5 text-left text-xs font-semibold text-sedp-ink">
                Arsitektur:{" "}
                {isRepeatered
                  ? "Repeatered EDFA (OSNR_ASE per 0,1 nm)"
                  : "Repeaterless (Daya Terima)"}
              </caption>
              <thead>
                <tr className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Titik Profil
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Jarak Kumulatif (km)
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Redaman Serat (dB)
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Nilai BOL ({chartUnit})
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Nilai EOL ({chartUnit})
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">
                    Ambang Ilustrasi ({chartUnit})
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.profileSeries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-sedp-muted">
                      Perbaiki parameter tidak valid untuk menampilkan profil per titik.
                    </td>
                  </tr>
                ) : (
                  result.profileSeries.map((pt) => (
                    <tr
                      key={pt.stepLabel}
                      className="border-b border-sedp-subtle-border last:border-b-0"
                    >
                      <th scope="row" className="px-3 py-2.5 font-mono text-sedp-accent">
                        {pt.stepLabel}
                      </th>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {pt.distanceKm.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {pt.fiberLossDb.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {pt.bolValue.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-ink tabular-nums">
                        {pt.eolValue.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-sedp-muted tabular-nums">
                        {pt.referenceValue.toFixed(2)}
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
