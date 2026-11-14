import Image from "next/image";

import { PLACE_URL, type Copy } from "@/lib/copy";

/** The room itself: one wide photo of the bar, then three corners of the café. */
export function Place({ t }: { t: Copy["coffee"] }) {
  const [wide, ...rest] = t.photos;
  return (
    <section id="coffee" aria-labelledby="coffee-title" className="pt-14 md:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h2 id="coffee-title" className="title-thin text-heading">
              {t.title}
            </h2>
            <p className="text-soft mt-1">{t.lead}</p>
          </div>
          <a href={PLACE_URL} target="_blank" rel="noopener noreferrer" className="btn-mocha shrink-0 px-8">
            {t.cta}
          </a>
        </header>

        <figure className="mt-6">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/8]">
            <Image src={wide.src} alt={wide.alt} fill sizes="(min-width: 1152px) 1104px, 100vw" className="object-cover object-[50%_68%]" />
          </div>
          <figcaption className="mt-2 text-sm">{wide.label}</figcaption>
        </figure>

        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3">
          {rest.map((p, i) => (
            <li key={p.src} className={i === 2 ? "col-span-2 md:col-span-1" : undefined}>
              <figure>
                <div className={`relative overflow-hidden ${i === 2 ? "aspect-[4/3] md:aspect-[4/5]" : "aspect-[4/5]"}`}>
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-sm">{p.label}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {/* The concept: a bold statement, the short description underneath. */}
        <div className="mt-16 md:mt-24">
          <p className="font-grotesk max-w-[19ch] text-[clamp(1.75rem,1.3rem+1.8vw,3rem)] leading-[1.12] font-medium tracking-[0.01em] uppercase">{t.statement}</p>
          <p className="text-soft mt-6 max-w-lg leading-relaxed">{t.concept}</p>
        </div>
      </div>
    </section>
  );
}
