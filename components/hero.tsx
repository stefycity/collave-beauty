import Image from "next/image";

import type { Copy } from "@/lib/copy";

/** Light snowfall: a few soft flakes with fixed positions so the page renders the same every time. */
const FLAKES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 2 + ((i * 7) % 4),
  duration: 11 + ((i * 5) % 9),
  delay: -((i * 13) % 19),
  drift: ((i % 5) - 2) * 12,
  opacity: 0.45 + ((i * 3) % 5) / 10,
}));

export function Hero({ t }: { t: Copy["hero"] }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[32rem] items-center justify-center overflow-hidden px-6 py-20 text-center text-white md:min-h-[42rem]">
      <Image src="/site/hero-ribbons.webp" alt={t.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[50%_45%]" />
      {/* The photo is light, so a soft veil keeps the white text readable. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />
      <div aria-hidden="true" className="hero-snow -z-10">
        {FLAKES.map((f, i) => (
          <span
            key={i}
            style={
              {
                left: `${f.left}%`,
                width: f.size,
                height: f.size,
                opacity: f.opacity,
                animationDuration: `${f.duration}s`,
                animationDelay: `${f.delay}s`,
                "--drift": `${f.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="max-w-2xl [text-shadow:0_1px_12px_rgb(0_0_0/0.25)]">
        <p className="text-sm tracking-wide uppercase">{t.eyebrow}</p>
        <h1 id="hero-title" className="text-display mt-3 leading-tight font-light tracking-wide uppercase">
          {t.title}
        </h1>
        <a href="#beauty" className="btn-white mt-7 [text-shadow:none]">
          {t.cta}
        </a>
      </div>
    </section>
  );
}
