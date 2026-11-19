import type { ReactNode } from "react";
import type { MdxComponentsMap } from "@/lib/content/mdx";
import { SystemExplorerLab } from "@/features/simulators/components/system-explorer-lab";

export function createLessonMdxComponents(): MdxComponentsMap {
  return {
    SystemExplorerBay: () => (
      <div className="my-6">
        <SystemExplorerLab variant="embedded" />
      </div>
    ),
    table: ({ children }: { children?: ReactNode }) => (
      <div
        tabIndex={0}
        role="region"
        aria-label="Tabel perbandingan arsitektur sistem kabel laut"
        className="my-6 overflow-x-auto rounded-md border border-sedp-control-border bg-sedp-surface"
      >
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: ReactNode }) => (
      <thead className="border-b border-sedp-subtle-border bg-sedp-inset text-sedp-ink">
        {children}
      </thead>
    ),
    th: ({ children }: { children?: ReactNode }) => (
      <th scope="col" className="px-4 py-3 font-semibold text-sedp-ink">
        {children}
      </th>
    ),
    td: ({ children }: { children?: ReactNode }) => (
      <td className="border-t border-sedp-subtle-border px-4 py-3 align-top text-sedp-ink">
        {children}
      </td>
    ),
  };
}
