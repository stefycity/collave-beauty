import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import { notFound } from "next/navigation";

import { getCopy, hasLocale, locales } from "@/lib/copy";
import "../globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getCopy(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { en: "/en", bg: "/bg" } },
    openGraph: { title: t.meta.title, description: t.meta.description },
  };
}

export const viewport: Viewport = { themeColor: "#fbf7f2" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}
