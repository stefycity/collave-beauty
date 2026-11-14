import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MemberRail } from "@/components/member-rail";
import { getCopy, hasLocale } from "@/lib/copy";

export async function generateMetadata({ params }: PageProps<"/[lang]/press">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getCopy(lang);
  return { title: `${t.press.eyebrow} — Collavé`, description: t.press.lead };
}

export default async function Press({ params }: PageProps<"/[lang]/press">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getCopy(lang);
  const p = t.press;
  const date = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(lang === "bg" ? "bg-BG" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <header className="text-center">
            <p className="text-soft text-xs tracking-[0.3em] uppercase">{p.eyebrow}</p>
            <h1 className="text-display mt-3 font-light tracking-wide uppercase">{p.title}</h1>
            <p className="text-soft mx-auto mt-4 max-w-xl">{p.lead}</p>
            {/* The mastheads, large: who wrote about us, at a glance. */}
            <ul className="border-line mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-14 gap-y-4 border-y py-8">
              {p.items.map((m) => (
                <li key={m.url} className="text-[clamp(1.5rem,1rem+1.6vw,2.5rem)] leading-none font-light tracking-[0.12em] uppercase">
                  {m.magazine}
                </li>
              ))}
            </ul>
          </header>

          <ul className="mt-16 space-y-16 md:mt-24 md:space-y-24">
            {p.items.map((m, i) => (
              <li key={m.url}>
                <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                  <div className={`relative aspect-[4/3] overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
                    <Image src={m.image} alt={m.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className={`object-cover ${"focus" in m ? m.focus : ""}`} />
                  </div>
                  <div>
                    <p className="text-[clamp(2rem,1.4rem+2.4vw,3.5rem)] leading-none font-light tracking-[0.1em] uppercase">{m.magazine}</p>
                    <p className="text-soft mt-3 text-xs tracking-[0.2em] uppercase">
                      {m.note} · {date(m.date)}
                    </p>
                    <h2 className="border-line mt-6 border-t pt-6 text-xl leading-snug font-light md:text-2xl">“{m.headline}”</h2>
                    {lang === "bg" ? null : <p className="text-soft mt-2 text-sm">{p.lang}</p>}
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="btn-mocha mt-6 w-auto px-8">
                      {p.read}
                      <ArrowUpRight className="size-4" strokeWidth={1.25} aria-hidden />
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
