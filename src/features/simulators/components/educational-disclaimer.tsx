export const EDUCATIONAL_MODELLING_DISCLAIMER =
  "Simulator ini memakai model analitis yang disederhanakan (rugi span seragam, penurunan tegangan repeater konstan, estimasi ASE/OSNR linier tanpa simulasi penuh efek nonlinier Kerr, resistansi gangguan shunt ideal, dan kelonggaran serat nominal) khusus untuk memahami intuisi konsep. Hasil perhitungan bukan alat rekayasa produksi dan tidak boleh digunakan untuk desain komersial, operasi tegangan tinggi PFE, penentuan koordinat kapal perbaikan, atau perizinan rute kelautan.";

export function EducationalModellingDisclaimer() {
  return (
    <aside
      aria-label="Penafian Pemodelan Edukatif"
      className="rounded-md border border-sedp-control-border bg-sedp-inset p-4 text-xs leading-relaxed text-sedp-ink"
    >
      <p className="font-semibold text-sedp-accent">Penafian Pemodelan Edukatif</p>
      <p className="mt-1 text-sedp-muted">{EDUCATIONAL_MODELLING_DISCLAIMER}</p>
    </aside>
  );
}
