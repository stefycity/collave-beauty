import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Booking } from "@/components/booking";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MemberRail } from "@/components/member-rail";
import { getCopy, hasLocale } from "@/lib/copy";
import { getMenu } from "@/lib/menu";

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getCopy(lang);
  return { title: `${t.book.title} — Collavé`, description: t.book.lead };
}

export default async function Book({ params }: PageProps<"/[lang]/book">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getCopy(lang);
  const b = t.book;
  // A short look at the collection: the first face, hair and body products and the collagen jar.
  const menu = getMenu(lang);
  const picks = [...menu.beauty.slice(0, 3).map((g) => g.items[1] ?? g.items[0]), menu.collagen[0]?.items[0]].filter(Boolean);

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_0.8fr] md:gap-14">
            <header>
              <p className="text-soft text-xs tracking-[0.3em] uppercase">{b.eyebrow}</p>
              <h1 className="text-display mt-3 font-light tracking-wide uppercase">{b.title}</h1>
              <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed">{b.lead}</p>

              <section aria-labelledby="book-products" className="mt-10">
                <h2 id="book-products" className="text-soft text-xs tracking-[0.3em] uppercase">
                  {b.products}
                </h2>
                <ul className="mt-4 grid max-w-md grid-cols-2 gap-x-6 gap-y-4">
                  {picks.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <div className="bg-mist relative h-16 w-12 shrink-0 overflow-hidden">
                        <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <p className="text-sm leading-snug">{p.name}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </header>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/site/book-store.webp" alt={b.photoAlt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover object-[50%_60%]" />
            </div>
          </div>

          <p id="calendar" className="text-soft mt-16 scroll-mt-20">{b.choose}</p>
          <div className="border-line mt-4 border-t pt-10">
            <Booking t={b} club={t.club} lang={lang} />
          </div>
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
