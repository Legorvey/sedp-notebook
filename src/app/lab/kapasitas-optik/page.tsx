import type { Metadata } from "next";
import { LabWorkbenchShell } from "@/features/simulators/components/lab-workbench-shell";
import { OpticalCapacityLab } from "@/features/simulators/components/optical-capacity-lab";

const TITLE = "Kalkulator Kapasitas Optik Sistem Kabel Laut";
const DESCRIPTION =
  "Hitung kapasitas per pasangan serat (searah), total kapasitas searah, agregat dua arah, dan okupansi slot DWDM pada pita C maupun C+L.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
};

export default function OpticalCapacityLabPage() {
  return (
    <LabWorkbenchShell shortLabel="Kapasitas Optik" title={TITLE} description={DESCRIPTION}>
      <OpticalCapacityLab />
    </LabWorkbenchShell>
  );
}
