"use client";

import { RouteErrorView } from "@/components/layout/route-states";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorView onRetry={reset} />;
}
