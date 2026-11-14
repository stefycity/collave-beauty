import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HelpSections, ReturnForm } from "@/components/help";
import { MemberRail } from "@/components/member-rail";
import { getCopy, hasLocale, locales } from "@/lib/copy";

// Footer information pages. Content still to come from Collavé.
const PAGES = ["heritage", "legal", "delivery", "faq"] as const;
type Page = (typeof PAGES)[number];
const isPage = (p: string): p is Page => (PAGES as readonly string[]).includes(p);

export function generateStaticParams() {
  return locales.flatMap((lang) => PAGES.map((page) => ({ lang, page })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/info/[page]">): Promise<Metadata> {
  const { lang, page } = await params;
  if (!hasLocale(lang) || !isPage(page)) return {};
  return { title: `${getCopy(lang).footer.info[page]} — Collavé` };
}

export default async function InfoPage({ params }: PageProps<"/[lang]/info/[page]">) {
  const { lang, page } = await params;
  if (!hasLocale(lang) || !isPage(page)) notFound();
  const t = getCopy(lang);
  const info = t.footer.info;

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main" className="mx-auto min-h-[60svh] max-w-4xl px-6 py-20 md:py-28">
        <p className="text-soft text-xs tracking-[0.3em] uppercase">{info.title}</p>
        <h1 className="text-display mt-3 font-light tracking-wide uppercase">{info[page]}</h1>
        {page === "delivery" || page === "faq" ? (
          <>
            <p className="text-soft mt-3 max-w-xl">{page === "faq" ? t.help.faq.lead : t.help.delivery.lead}</p>
            <div className="mt-12">
              <HelpSections t={t.help} ids={page === "faq" ? ["shipping", "returns", "payments"] : ["shipping", "returns"]} />
            </div>
            {page === "delivery" ? (
              <div className="mt-14">
                <ReturnForm t={t.help.returnForm} lang={lang} />
              </div>
            ) : null}
          </>
        ) : (
          <div className="border-line mt-10 max-w-md border-t pt-8">
            <p>{info.soon}</p>
            <a href={`/${lang}`} className="btn-mocha mt-6 w-auto px-8">
              {info.back}
            </a>
          </div>
        )}
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
