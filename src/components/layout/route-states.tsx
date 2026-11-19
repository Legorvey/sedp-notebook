"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteLoadingViewProps {
  message?: string;
}

export function RouteLoadingView({
  message = "Memuat isi pelajaran dan diagram...",
}: RouteLoadingViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div
        role="status"
        aria-busy="true"
        className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6 sm:p-8"
      >
        <p className="font-mono text-xs font-semibold text-sedp-accent">Memuat Data</p>
        <p className="mt-2 text-base font-medium text-sedp-ink">{message}</p>
        <div
          aria-hidden="true"
          className="mt-4 h-3 w-48 rounded-sm border border-sedp-subtle-border bg-sedp-inset"
        />
      </div>
    </div>
  );
}

interface RouteErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function RouteErrorView({
  title = "Konten gagal dimuat",
  message = "Konten pelajaran gagal dimuat dari berkas lokal. Muat ulang halaman atau kembali ke Daftar Kurikulum.",
  onRetry,
}: RouteErrorViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div
        role="alert"
        className="rounded-[10px] border border-sedp-fault bg-sedp-surface p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-sedp-fault" aria-hidden="true" />
          <div>
            <h1 className="font-display text-xl font-bold text-sedp-ink">{title}</h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-sedp-muted">{message}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {onRetry && (
                <Button type="button" onClick={onRetry}>
                  Muat Ulang Halaman
                </Button>
              )}
              <Link
                href="/kurikulum/"
                className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
              >
                Kembali ke Daftar Kurikulum
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
