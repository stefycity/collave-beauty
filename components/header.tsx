"use client";

import { MapPin, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Club } from "@/components/club";
import { MAPS_URL, type Copy, locales } from "@/lib/copy";

const LOGO = "/brand/collave-logo.webp";

export function Header({ lang, t }: { lang: string; t: Copy }) {
  const [open, setOpen] = useState(false);
  const links: { href: string; label: string; sub?: { href: string; label: string }[] }[] = [
    { href: `/${lang}#beauty`, label: t.nav.beauty, sub: t.beautyMenu.map((m) => ({ href: `/${lang}${m.href}`, label: m.label })) },
    { href: `/${lang}#coffee`, label: t.nav.coffee },
    { href: `/${lang}#rooms`, label: t.nav.rooms, sub: t.rooms.menu.map((m) => ({ href: `/${lang}${m.href}`, label: m.label })) },
    { href: `/${lang}#about`, label: t.nav.about },
    { href: `/${lang}/blog`, label: t.nav.blog, sub: t.blog.menu.map((m) => ({ href: `/${lang}${m.href}`, label: m.label })) },
  ];

  return (
    <header className="bg-cream sticky top-0 z-40">
      <div className="mx-auto grid h-14 max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
        <div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={t.nav.menu}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-11 items-center justify-center xl:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
          <nav aria-label={t.nav.label} className="hidden xl:block">
            <ul className="-ml-2.5 flex gap-1 text-[0.6875rem] font-light tracking-[0.2em] whitespace-nowrap uppercase">
              {links.map((l) => (
                <li key={l.href} className="group relative">
                  <a href={l.href} className="inline-flex min-h-11 items-center px-2.5 transition-colors duration-200 group-hover:bg-wine group-hover:text-white hover:bg-wine hover:text-white focus-visible:bg-wine focus-visible:text-white">
                    {l.label}
                  </a>
                  {l.sub ? (
                    // Small window of services: opens on hover or keyboard focus.
                    <div className="invisible absolute top-full -left-5 z-50 pt-2 opacity-0 transition-[opacity,visibility] duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <ul className="bg-cream border-line min-w-60 border py-2 text-[0.8125rem] normal-case tracking-normal shadow-[0_18px_40px_-20px_rgba(68,39,18,0.35)]">
                        {l.sub.map((s) => (
                          <li key={s.href}>
                            <a href={s.href} className="flex min-h-11 items-center px-5 whitespace-nowrap hover:bg-wine/10">
                              {s.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <a href={`/${lang}#top`} aria-label={t.nav.home} className="block w-24">
          <span
            aria-hidden="true"
            className="bg-ink block w-full"
            style={{
              aspectRatio: "1926 / 817",
              mask: `url(${LOGO}) center / contain no-repeat`,
              WebkitMask: `url(${LOGO}) center / contain no-repeat`,
            }}
          />
        </a>

        <div className="flex items-center justify-end gap-1 text-[0.8125rem]">
          <div role="group" aria-label={t.nav.language} className="flex">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                hrefLang={l}
                aria-current={l === lang ? "true" : undefined}
                className={`inline-flex min-h-11 min-w-8 items-center justify-center uppercase sm:min-w-9 ${l === lang ? "underline underline-offset-4" : "text-soft hover:text-ink"}`}
              >
                {l}
              </Link>
            ))}
          </div>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.nav.maps}
            className="hidden size-11 items-center justify-center sm:inline-flex"
          >
            <MapPin className="size-5" strokeWidth={1.5} aria-hidden />
          </a>
          <Club t={t.club} lang={lang} forgot={t.help.forgot} />
        </div>
      </div>

      <nav id="mobile-nav" aria-label={t.nav.label} hidden={!open} className="bg-cream border-line border-t xl:hidden">
        <ul className="px-6 py-3">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-sm font-light tracking-[0.28em] uppercase">
                {l.label}
              </a>
              {l.sub ? (
                <ul className="border-line mb-2 ml-1 border-l pl-4">
                  {l.sub.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} onClick={() => setOpen(false)} className="text-soft hover:text-ink flex min-h-11 items-center text-[0.9375rem]">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
