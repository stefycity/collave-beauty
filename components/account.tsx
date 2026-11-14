"use client";

import { ArrowLeft, CalendarHeart, Coffee, Croissant, Droplet, Gem, Heart, ShoppingBag, Sparkles, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { Copy } from "@/lib/copy";
import type { Item } from "@/lib/menu";
import { ProfileActions } from "@/components/profile-actions";
import { openView, signOut, toggleSaved, useMember, useWishlist, type View } from "@/lib/member";

/**
 * Members only: a thin rail on the left (a small bar at the bottom on phones) with
 * profile, wish list and purchases. Each one turns the page into that view.
 */
const SECTION_ICONS = { beauty: Sparkles, collagen: Droplet, coffee: Coffee, breakfast: Croissant, events: CalendarHeart };

type Section = { href: string; label: string; icon: keyof typeof SECTION_ICONS };

export function Account({ t, profile, lang, sections, products }: { t: Copy["club"]; profile: Copy["help"]["profile"]; lang: string; sections: Section[]; products: Item[] }) {
  const member = useMember();
  // Show saved products in the page language; fall back to what was saved.
  const saved = useWishlist().map((s) => {
    const p = products.find((x) => x.id === s.id);
    return p ? { id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, image: p.image } : s;
  });
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    const onView = (e: Event) => setView((e as CustomEvent<View | null>).detail);
    window.addEventListener("collave:view", onView);
    return () => window.removeEventListener("collave:view", onView);
  }, []);

  // While a view is open the page behind it stays still; Esc returns to the site.
  useEffect(() => {
    if (!view) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setView(null);
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [view]);

  // Members get a full-height rail; the page moves over to make room on wide screens.
  useEffect(() => {
    if (!member) setView(null);
    document.documentElement.toggleAttribute("data-member", !!member);
  }, [member]);

  if (!member) return null;

  const items: { id: View; label: string; icon: typeof User; count?: number }[] = [
    { id: "profile", label: t.profile, icon: User },
    { id: "membership", label: t.membership, icon: Gem },
    { id: "wishlist", label: t.wishlist, icon: Heart, count: saved.length },
    { id: "purchases", label: t.purchases, icon: ShoppingBag },
  ];

  return (
    <>
      <nav
        aria-label={t.account}
        className="bg-cream/90 border-line fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full border p-1 shadow-[0_12px_30px_-18px_rgba(68,39,18,0.4)] backdrop-blur lg:inset-y-0 lg:left-0 lg:w-16 lg:translate-x-0 lg:flex-col lg:items-center lg:gap-2 lg:rounded-none lg:border-y-0 lg:border-l-0 lg:bg-cream lg:py-1.5 lg:shadow-none lg:backdrop-blur-none"
      >
        {items.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={view === id ? "page" : undefined}
            onClick={() => openView(view === id ? null : id)}
            className={`group relative inline-flex size-11 items-center justify-center rounded-full transition-colors duration-200 ${view === id ? "bg-[#b07778]/25" : "hover:bg-[#b07778]/15"}`}
          >
            <Icon className="size-[1.125rem]" strokeWidth={1.25} aria-hidden />
            {count ? (
              <span aria-hidden="true" className="absolute top-1 right-1 min-w-4 rounded-full bg-[#b07778] px-1 text-center text-[0.625rem] leading-4 text-white">
                {count}
              </span>
            ) : null}
            <span aria-hidden="true" className="bg-ink pointer-events-none absolute left-full ml-3 hidden rounded-sm px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
              {label}
            </span>
          </button>
        ))}
        <span aria-hidden="true" className="bg-line my-2 hidden h-px w-6 lg:block" />
        <p className="sr-only">{t.explore}</p>
        {sections.map(({ href, label, icon }) => {
          const Icon = SECTION_ICONS[icon];
          return (
            <a
              key={href}
              href={href}
              aria-label={label}
              onClick={() => openView(null)}
              className="group relative hidden size-11 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#b07778]/15 lg:inline-flex"
            >
              <Icon className="size-[1.125rem]" strokeWidth={1.25} aria-hidden />
              <span aria-hidden="true" className="bg-ink pointer-events-none absolute left-full ml-3 hidden rounded-sm px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
                {label}
              </span>
            </a>
          );
        })}
        {view ? (
          <button
            type="button"
            aria-label={t.back}
            onClick={() => openView(null)}
            className="group relative inline-flex size-11 items-center justify-center rounded-full hover:bg-[#b07778]/15 lg:mt-auto"
          >
            <X className="size-[1.125rem] lg:hidden" strokeWidth={1.25} aria-hidden />
            <ArrowLeft className="hidden size-[1.125rem] lg:block" strokeWidth={1.25} aria-hidden />
            <span aria-hidden="true" className="bg-ink pointer-events-none absolute left-full ml-3 hidden rounded-sm px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block">
              {t.back}
            </span>
          </button>
        ) : null}
      </nav>

      {view ? (
        <section
          aria-labelledby="account-title"
          className="club-in bg-cream fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto pb-28 lg:left-16 lg:pb-0"
        >
          <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
            <p className="text-soft text-xs tracking-[0.3em] uppercase">Collavé Club</p>

            {view === "profile" ? (
              <>
                <h2 id="account-title" className="text-display mt-3 font-light tracking-wide uppercase">
                  {t.hello}, {member.name}
                </h2>
                <dl className="border-line mt-10 max-w-md border-t">
                  <div className="border-line flex justify-between gap-4 border-b py-4">
                    <dt className="text-soft text-sm tracking-wide uppercase">{t.name}</dt>
                    <dd>{member.name}</dd>
                  </div>
                  {member.surname ? (
                    <div className="border-line flex justify-between gap-4 border-b py-4">
                      <dt className="text-soft text-sm tracking-wide uppercase">{t.surname}</dt>
                      <dd>{member.surname}</dd>
                    </div>
                  ) : null}
                  <div className="border-line flex justify-between gap-4 border-b py-4">
                    <dt className="text-soft text-sm tracking-wide uppercase">{t.email}</dt>
                    <dd className="truncate">{member.email}</dd>
                  </div>
                  {member.phone ? (
                    <div className="border-line flex justify-between gap-4 border-b py-4">
                      <dt className="text-soft text-sm tracking-wide uppercase">{t.phone}</dt>
                      <dd>{member.phone}</dd>
                    </div>
                  ) : null}
                </dl>
                <ProfileActions member={member} t={t} p={profile} />
                <button type="button" onClick={signOut} className="text-soft hover:text-ink mt-8 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                  {t.signOut}
                </button>
              </>
            ) : null}

            {view === "membership" ? (
              <>
                <h2 id="account-title" className="text-display mt-3 font-light tracking-wide uppercase">
                  {t.membership}
                </h2>
                <div className="mt-10 flex aspect-[1.6] w-full max-w-sm flex-col justify-between border border-[#b07778]/60 bg-[#b07778]/15 p-6">
                  <p className="text-xs tracking-[0.3em] uppercase">Collavé Club</p>
                  <div>
                    <p className="text-xl font-light">{[member.name, member.surname].filter(Boolean).join(" ")}</p>
                    {member.since ? (
                      <p className="text-soft mt-1 text-sm">
                        {t.memberSince}{" "}
                        {new Date(member.since).toLocaleDateString(lang === "bg" ? "bg-BG" : "en-GB", { month: "long", year: "numeric" })}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="border-line mt-10 max-w-md border-t pt-6">
                  <h3 className="text-soft text-sm tracking-wide uppercase">{t.benefit}</h3>
                  <p className="mt-2">{t.perk}</p>
                </div>
              </>
            ) : null}

            {view === "wishlist" ? (
              <>
                <h2 id="account-title" className="text-display mt-3 font-light tracking-wide uppercase">
                  {t.wishlist}
                </h2>
                {saved.length ? (
                  <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
                    {saved.map((s) => (
                      <li key={s.id}>
                        <div className="bg-mist relative aspect-[4/5] overflow-hidden">
                          <Image src={s.image} alt={s.name} fill sizes="(min-width: 768px) 280px, 45vw" className="object-cover" />
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <h3 className="text-[1.0625rem]">{s.name}</h3>
                          {s.price ? <p className="shrink-0">{s.price}</p> : null}
                        </div>
                        <p className="text-soft mt-0.5 text-sm">{s.subtitle}</p>
                        <button type="button" onClick={() => toggleSaved(s)} className="text-soft hover:text-ink mt-1 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                          {t.remove}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text={t.noWishlist} cta={t.discover} />
                )}
              </>
            ) : null}

            {view === "purchases" ? (
              <>
                <h2 id="account-title" className="text-display mt-3 font-light tracking-wide uppercase">
                  {t.purchases}
                </h2>
                <Empty text={t.noPurchases} cta={t.discover} />
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

function Empty({ text, cta }: { text: string; cta: string }) {
  return (
    <div className="border-line mt-10 max-w-md border-t pt-8">
      <p className="text-soft">{text}</p>
      <a href="#beauty" onClick={() => openView(null)} className="btn-rose mt-6 w-auto px-8">
        {cta}
      </a>
    </div>
  );
}
