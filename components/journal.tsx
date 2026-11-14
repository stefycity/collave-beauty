"use client";

import Image from "next/image";
import { useState } from "react";

import type { Copy } from "@/lib/copy";

type Topic = keyof Copy["blog"]["topics"];

/** Blog templates: topic filter, one featured story and a grid of upcoming posts. */
export function Journal({ t }: { t: Copy["blog"] }) {
  const [topic, setTopic] = useState<Topic | "all">("all");
  const posts = t.posts.filter((p) => topic === "all" || p.topic === topic);
  const [featured, ...rest] = posts;
  const topics = Object.entries(t.topics) as [Topic, string][];

  const meta = (p: (typeof t.posts)[number]) => (
    <p className="text-soft flex flex-wrap items-center gap-x-3 text-xs tracking-[0.2em] uppercase">
      <span>{t.topics[p.topic as Topic]}</span>
      <span aria-hidden="true">·</span>
      <span>
        {p.minutes} {t.read}
      </span>
    </p>
  );

  const soon = <span className="mt-4 inline-block border border-[#b07778]/60 bg-[#b07778]/15 px-3 py-1 text-xs tracking-[0.2em] uppercase">{t.soon}</span>;

  return (
    <>
      <div role="group" aria-label={t.eyebrow} className="rail mt-10 flex gap-2 overflow-x-auto pb-1 md:justify-center">
        {[["all", t.all] as const, ...topics].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={topic === id}
            onClick={() => setTopic(id)}
            className={`min-h-11 shrink-0 rounded-full border px-5 text-sm transition-colors duration-200 ${
              topic === id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {featured ? (
        <article key={`${topic}-featured`} className="club-in mt-12 grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="bg-mist relative aspect-[4/3] overflow-hidden">
            <Image src={featured.image} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase">{t.featured}</p>
            <div className="mt-3">{meta(featured)}</div>
            <h2 className="mt-3 text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-tight font-light">{featured.title}</h2>
            <p className="text-soft mt-3 max-w-md">{featured.excerpt}</p>
            {soon}
          </div>
        </article>
      ) : (
        <p className="text-soft mt-12">{t.empty}</p>
      )}

      {rest.length ? (
        <ul key={topic} className="club-in border-line mt-14 grid gap-x-8 gap-y-12 border-t pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.title}>
              <article>
                <div className="bg-mist relative aspect-[4/5] overflow-hidden">
                  <Image src={p.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="mt-4">{meta(p)}</div>
                <h3 className="mt-2 text-xl leading-snug font-light">{p.title}</h3>
                <p className="text-soft mt-2 text-[0.9375rem]">{p.excerpt}</p>
                {soon}
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
