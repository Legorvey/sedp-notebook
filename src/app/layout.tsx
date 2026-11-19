import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "SEDP Learning Hub | Catatan Belajar Independen Sistem Kabel Laut",
    template: "%s | SEDP Learning Hub",
  },
  description:
    "Sumber belajar publik independen berbahasa Indonesia tentang arsitektur sistem komunikasi kabel laut, simulasi interaktif, dan latihan konseptual.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Pre-paint initializer avoids light/dark FOUC without external head requests (R-40).
const THEME_INIT_SCRIPT =
  "(function(){try{if(window.localStorage.getItem('sedp.theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${sourceSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <head>
        <script>{THEME_INIT_SCRIPT}</script>
      </head>
      <body className="min-h-full flex flex-col bg-sedp-canvas text-sedp-ink">
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
