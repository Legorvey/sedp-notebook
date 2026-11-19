"use client";

import { RouteErrorView } from "@/components/layout/route-states";

export default function ReferenceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorView
      title="Indeks rujukan gagal dibaca"
      message="Indeks rujukan gagal dibaca. Muat ulang halaman untuk mencoba lagi."
      onRetry={reset}
    />
  );
}
