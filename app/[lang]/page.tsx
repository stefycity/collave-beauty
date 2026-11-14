import { notFound } from "next/navigation";

import { About } from "@/components/about";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { MemberRail } from "@/components/member-rail";
import { Place } from "@/components/place";
import { Shelf } from "@/components/shelf";
import { Rail } from "@/components/rail";
import { Rooms } from "@/components/rooms";
import { getCopy, hasLocale } from "@/lib/copy";
import { getBreakfast, getMenu } from "@/lib/menu";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getCopy(lang);
  const menu = getMenu(lang);

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main">
        <Hero t={t.hero} />
        <Rail id="beauty" title={t.beauty.title} groups={menu.beauty} columns={3} labels={t.item} allLabels={t.beauty} wish={t.club} />
        <Rail id="collagen" title={t.collagen.title} groups={menu.collagen} columns={3} labels={t.item} intro={t.collagen} wish={t.club} />
        <p className="bg-wine px-6 py-5 text-center text-sm tracking-wide text-white uppercase">{t.band}</p>
        <About t={t.about} />
        <Place t={t.coffee} />
        <Rail id="drinks" title={t.coffee.drinks} groups={menu.drinks} columns={3} labels={t.item} drinkCard={{ strip: t.coffee.strip, action: { href: "#visit", label: t.coffee.visit } }} />
        <Shelf id="breakfast" title={t.coffee.breakfast} subtitle={t.coffee.breakfastSub} groups={getBreakfast(lang)} labels={t.item} />
        <Rooms t={t.rooms} form={t.form} lang={lang} />
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
