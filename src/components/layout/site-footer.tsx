import Link from "next/link";
import { FOOTER_GOVERNANCE_LINKS, FOOTER_LEARNING_LINKS } from "./nav-links";

export function SiteFooter() {
  return (
    <footer className="border-t border-sedp-subtle-border bg-sedp-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-base font-bold text-sedp-ink">
            SEDP Learning Hub (Independen)
          </p>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-sedp-muted">
            Sumber belajar publik independen mengenai rekayasa sistem komunikasi kabel laut. Situs
            ini bukan produk resmi, tidak berafiliasi, dan tidak disponsori oleh SEDP, Telkom
            University, NEC, maupun operator komersial mana pun.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-sedp-muted">
            Tanpa pelacak pihak ketiga, tanpa akun wajib, dan progres latihan disimpan secara lokal
            di peramban Anda saja.
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="text-sm font-semibold text-sedp-ink">Belajar &amp; Eksplorasi</h2>
          <ul className="mt-3 space-y-1">
            {FOOTER_LEARNING_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center text-sm text-sedp-muted underline-offset-4 hover:text-sedp-accent hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h2 className="text-sm font-semibold text-sedp-ink">Transparansi &amp; Sumber</h2>
          <ul className="mt-3 space-y-1">
            {FOOTER_GOVERNANCE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center text-sm text-sedp-muted underline-offset-4 hover:text-sedp-accent hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
