import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BeautyBox, type BoxProduct } from "@/components/beauty-box";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MemberRail } from "@/components/member-rail";
import { getCopy, hasLocale } from "@/lib/copy";
import { getMenu } from "@/lib/menu";

export async function generateMetadata({ params }: PageProps<"/[lang]/box">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getCopy(lang);
  return { title: `${t.box.title} — Collavé`, description: t.box.lead };
}

export default async function Box({ params }: PageProps<"/[lang]/box">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getCopy(lang);
  const b = t.box;
  const menu = getMenu(lang);

  // Every beauty product once (some appear in two categories), plus the collagen powders.
  const seen = new Set<string>();
  const products: BoxProduct[] = [];
  for (const g of [...menu.beauty, ...menu.collagen.map((c) => ({ ...c, id: "collagen" }))]) {
    for (const i of g.items) {
      if (seen.has(i.image)) continue;
      seen.add(i.image);
      products.push({ id: i.id, name: i.name, subtitle: i.subtitle, price: i.price, amount: i.amount ?? null, image: i.image, group: g.id });
    }
  }
  const groups = [...menu.beauty.map((g) => ({ id: g.id, name: g.name })), { id: "collagen", name: b.collagen }];

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <header className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div>
              <p className="text-soft text-xs tracking-[0.3em] uppercase">{b.eyebrow}</p>
              <h1 className="text-display mt-3 font-light tracking-wide uppercase">{b.title}</h1>
              <p className="text-soft mt-4 max-w-lg">{b.lead}</p>
              <ol className="mt-6 space-y-2 text-[0.9375rem]">
                {b.steps.map((s, i) => (
                  <li key={s} className="flex gap-4">
                    <span className="text-soft w-5 shrink-0 text-sm">0{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            {/* The box's size, shown simply */}
            <dl className="border-line border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-10">
              <dt className="text-soft text-xs tracking-[0.3em] uppercase">{b.dims.title}</dt>
              <dd className="mt-3 text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-none font-light tracking-wide">{b.dims.size}</dd>
              <dd className="text-soft mt-2 text-xs tracking-[0.2em] uppercase">{b.dims.label}</dd>
              <dd className="mt-4 text-sm">{b.dims.material}</dd>
              <dd className="text-soft mt-2 text-sm">{t.help.boxNote}</dd>
            </dl>
          </header>

          <div className="mt-12">
            <BeautyBox t={b} lang={lang} products={products} groups={groups} />
          </div>
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
