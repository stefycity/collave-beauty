import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Journal } from "@/components/journal";
import { MemberRail } from "@/components/member-rail";
import { getCopy, hasLocale } from "@/lib/copy";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getCopy(lang);
  return { title: `${t.blog.title} — Collavé`, description: t.blog.lead };
}

export default async function Blog({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getCopy(lang);

  return (
    <>
      <a href="#main" className="bg-ink fixed top-2 left-2 z-50 -translate-y-24 px-5 py-3 text-white focus:translate-y-0">
        {t.skip}
      </a>
      <Header lang={lang} t={t} />
      <main id="main" className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-soft text-xs tracking-[0.3em] uppercase">{t.blog.eyebrow}</p>
            <h1 className="text-display mt-3 font-light tracking-wide uppercase">{t.blog.title}</h1>
            <p className="text-soft mt-4">{t.blog.lead}</p>
          </header>
          <Journal t={t.blog} />
        </div>
      </main>
      <Footer t={t} lang={lang} />
      <MemberRail t={t} lang={lang} />
    </>
  );
}
