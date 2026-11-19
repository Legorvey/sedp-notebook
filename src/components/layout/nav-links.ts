export interface NavItem {
  label: string;
  href: string;
  matchPrefix: string;
}

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { label: "Beranda", href: "/", matchPrefix: "/" },
  { label: "Kurikulum", href: "/kurikulum/", matchPrefix: "/kurikulum" },
  { label: "Lab Simulasi", href: "/lab/", matchPrefix: "/lab" },
  { label: "Latihan", href: "/latihan/", matchPrefix: "/latihan" },
  { label: "Referensi", href: "/referensi/", matchPrefix: "/referensi" },
];

export const UTILITY_NAV_ITEM: NavItem = {
  label: "Tentang & Sumber",
  href: "/tentang/",
  matchPrefix: "/tentang",
};

export const FOOTER_LEARNING_LINKS: readonly { label: string; href: string }[] = [
  { label: "Daftar Kurikulum", href: "/kurikulum/" },
  { label: "Lab Simulasi", href: "/lab/" },
  { label: "Latihan Soal", href: "/latihan/" },
  { label: "Glosarium Istilah", href: "/referensi/glosarium/" },
];

export const FOOTER_GOVERNANCE_LINKS: readonly { label: string; href: string }[] = [
  { label: "Tentang & Metodologi", href: "/tentang/" },
  { label: "Daftar Sumber Publik", href: "/tentang/sumber/" },
  { label: "Log Verifikasi Fakta", href: "/tentang/verifikasi-fakta/" },
  { label: "Penafian Independensi", href: "/tentang/#penafian" },
  { label: "Privasi Penyimpanan Lokal", href: "/tentang/#privasi" },
];
