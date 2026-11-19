"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NumericStepperFieldProps {
  id: string;
  label: string;
  unit: string;
  value: number;
  rawText: string;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
  helperText?: string;
  errorMessage?: string;
  onNumberChange: (nextNumber: number, nextRawText: string) => void;
}

function roundToStepPrecision(val: number, step: number, integer?: boolean): number {
  if (integer) {
    return Math.round(val);
  }
  const stepStr = String(step);
  const decimals = stepStr.includes(".") ? stepStr.split(".")[1].length : 0;
  return Number(val.toFixed(decimals));
}

export function NumericStepperField({
  id,
  label,
  unit,
  value,
  rawText,
  min,
  max,
  step,
  integer = false,
  helperText,
  errorMessage,
  onNumberChange,
}: NumericStepperFieldProps) {
  const hintId = useId();
  const errorId = useId();
  const hasError = Boolean(errorMessage);

  function handleStep(direction: -1 | 1) {
    const base = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
    const candidate = roundToStepPrecision(base + direction * step, step, integer);
    const clamped = Math.min(max, Math.max(min, candidate));
    onNumberChange(clamped, String(clamped));
  }

  function handleInputChange(text: string) {
    if (text.trim() === "") {
      onNumberChange(Number.NaN, text);
      return;
    }
    const parsed = Number(text);
    onNumberChange(parsed, text);
  }

  const sliderValue = Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
  const describedBy = hasError ? `${hintId} ${errorId}` : hintId;

  return (
    <div className="rounded-md border border-sedp-subtle-border bg-sedp-surface p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-sedp-ink">
          {label}
        </label>
        <span className="font-mono text-xs text-sedp-muted">
          Rentang: {min} - {max} {unit}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Kurangi ${label} sebesar ${step} ${unit}`}
          onClick={() => handleStep(-1)}
          disabled={Number.isFinite(value) && value <= min}
          className="h-[44px] w-[44px] shrink-0 font-mono text-base font-bold"
        >
          -
        </Button>

        <div
          className={cn(
            "flex min-h-[44px] min-w-[120px] flex-1 items-center rounded-md border bg-sedp-canvas px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
            hasError ? "border-sedp-fault" : "border-sedp-control-border"
          )}
        >
          <input
            id={id}
            type="number"
            inputMode={integer ? "numeric" : "decimal"}
            step={step}
            min={min}
            max={max}
            value={rawText}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => handleInputChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm text-sedp-ink tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span
            aria-hidden="true"
            className="ml-2 shrink-0 font-mono text-xs whitespace-nowrap text-sedp-muted"
          >
            {unit}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Tambah ${label} sebesar ${step} ${unit}`}
          onClick={() => handleStep(1)}
          disabled={Number.isFinite(value) && value >= max}
          className="h-[44px] w-[44px] shrink-0 font-mono text-base font-bold"
        >
          +
        </Button>
      </div>

      <div className="mt-1.5 flex min-h-[44px] items-center">
        <input
          type="range"
          aria-label={`Penggeser ${label}`}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          aria-valuetext={`${sliderValue} ${unit}`}
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onNumberChange(parsed, event.target.value);
          }}
          className="h-6 w-full cursor-pointer accent-[var(--sedp-accent)]"
        />
      </div>

      <p id={hintId} className="mt-1 text-xs leading-relaxed text-sedp-muted">
        <span className="sr-only">
          Rentang {min} sampai {max} {unit}.{" "}
        </span>
        {helperText ?? `Gunakan tombol -, +, kolom angka, atau penggeser (${unit}).`}
      </p>

      {hasError && (
        <p id={errorId} className="mt-1.5 text-xs font-semibold text-sedp-fault">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
