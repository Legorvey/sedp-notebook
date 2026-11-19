import type { Metadata } from "next";
import { LabWorkbenchShell } from "@/features/simulators/components/lab-workbench-shell";
import { OpticalBudgetLab } from "@/features/simulators/components/optical-budget-lab";

const TITLE = "Simulator Redaman & Anggaran Daya Optik (BOL vs EOL)";
const DESCRIPTION =
  "Bandingkan penurunan daya serat pasif pada sistem repeaterless terhadap akumulasi derau ASE (OSNR) pada sistem ber-repeater EDFA.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function OpticalBudgetLabPage() {
  return (
    <LabWorkbenchShell shortLabel="Anggaran Daya Optik" title={TITLE} description={DESCRIPTION}>
      <OpticalBudgetLab />
    </LabWorkbenchShell>
  );
}
