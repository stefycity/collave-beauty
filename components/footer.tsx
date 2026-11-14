import { Newsletter } from "@/components/newsletter";
import { MAPS_URL, PHONE, SOCIALS, type Copy } from "@/lib/copy";

const LOGO = "/brand/collave-logo.webp";

export function Footer({ t, lang }: { t: Copy; lang: string }) {
  const f = t.footer;
  const label = "text-sm tracking-wide uppercase";
  const links = [
    { href: `/${lang}#beauty`, label: t.nav.beauty },
    { href: `/${lang}#coffee`, label: t.nav.coffee },
    { href: `/${lang}#rooms`, label: t.nav.rooms },
    { href: `/${lang}#about`, label: t.nav.about },
    { href: `/${lang}/blog`, label: t.nav.blog },
  ];
  const info = [
    { href: `/${lang}/info/heritage`, label: f.info.heritage },
    { href: `/${lang}#beauty`, label: f.info.skincare },
    { href: `/${lang}/info/legal`, label: f.info.legal },
    { href: `/${lang}/info/delivery`, label: f.info.delivery },
    { href: `/${lang}/info/delivery#return`, label: t.help.returnForm.title },
    { href: `/${lang}#rooms`, label: f.info.gifts },
    { href: `/${lang}/info/faq`, label: f.info.faq },
  ];
  return (
    <footer id="visit" className="bg-wine pt-14 pb-6 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Newsletter t={t.help.newsletter} lang={lang} />
        <span
          role="img"
          aria-label="Collavé"
          className="mt-10 block w-32 bg-white"
          style={{ aspectRatio: "1926 / 817", mask: `url(${LOGO}) center / contain no-repeat`, WebkitMask: `url(${LOGO}) center / contain no-repeat` }}
        />
        <div className="mt-8 grid gap-8 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h2 className={label}>{f.explore}</h2>
            <ul className="mt-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-flex min-h-9 items-center hover:underline">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={label}>{f.follow}</h2>
            <ul className="mt-2">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center hover:underline">{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={label}>{f.info.title}</h2>
            <ul className="mt-2">
              {info.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="inline-flex min-h-9 items-center hover:underline">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className={label}>{f.visit}</h2>
            <address className="mt-3 not-italic">
              {f.address.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </address>
            <a href={`tel:${PHONE.href}`} className="inline-flex min-h-9 items-center hover:underline">{PHONE.label}</a>
            <br />
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center underline underline-offset-4">{f.directions}</a>
          </div>
          <div>
            <h2 className={label}>{f.hoursTitle}</h2>
            <dl className="mt-3 space-y-1">
              {f.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-3">
                  <dt>{h.days}</dt>
                  <dd className="whitespace-nowrap">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <p className="border-white/25 mt-10 border-t pt-4 text-sm">
          © 2026 Collavé. {f.rights}
        </p>
      </div>
    </footer>
  );
}
