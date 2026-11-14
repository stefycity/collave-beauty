import Image from "next/image";

import type { Copy } from "@/lib/copy";

export function About({ t }: { t: Copy["about"] }) {
  return (
    <section id="about" aria-labelledby="about-title" className="grid md:grid-cols-2">
      {/* Two portraits side by side: Lili in the lounge, and a quiet coffee moment. */}
      <div className="grid aspect-[4/3] grid-cols-2 gap-1 md:aspect-auto md:min-h-[34rem]">
        <div className="relative">
          <Image src="/site/about-lili.webp" alt={t.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover object-[50%_30%]" />
        </div>
        <div className="relative">
          <Image src="/site/about-coffee.webp" alt={t.alt2} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover object-[50%_55%]" />
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16 text-center md:px-12">
        <div className="max-w-md">
          <p className="text-soft text-sm tracking-wide uppercase">{t.eyebrow}</p>
          <h2 id="about-title" className="title-thin text-heading mt-3">
            {t.title}
          </h2>
          <p className="text-soft mt-2">{t.lead}</p>
          <p className="mt-8 leading-relaxed">{t.body}</p>
          <p className="mt-6 text-sm leading-relaxed tracking-wide uppercase">{t.mission}</p>
        </div>
      </div>
    </section>
  );
}
