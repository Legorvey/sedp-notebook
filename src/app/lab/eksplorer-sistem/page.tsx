import type { Metadata } from "next";
import { LabWorkbenchShell } from "@/features/simulators/components/lab-workbench-shell";
import { SystemExplorerLab } from "@/features/simulators/components/system-explorer-lab";

const TITLE = "Eksplorer Arsitektur Sistem Kabel Laut Ujung-ke-Ujung";
const DESCRIPTION =
  "Bandingkan jalur optik dan jalur daya listrik DC PFE pada mode Repeatered, Open Cable (ITU-T G.977.1), dan Repeaterless (EDFA / ROPA).";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function SystemExplorerLabPage() {
  return (
    <LabWorkbenchShell shortLabel="Eksplorer Sistem" title={TITLE} description={DESCRIPTION}>
      <SystemExplorerLab variant="full" />
    </LabWorkbenchShell>
  );
}
