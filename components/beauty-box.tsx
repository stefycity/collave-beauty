"use client";

import { Check, ChevronLeft, ChevronRight, Plus, RotateCcw, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { requestBox } from "@/app/actions/box";
import type { Copy } from "@/lib/copy";
import { askToJoin, useMember } from "@/lib/member";

export type BoxProduct = { id: string; name: string; subtitle: string; price: string | null; amount: number | null; image: string; group: string };

const CAPACITY = 6;
const LOGO = "/brand/collave-logo.webp";
// Slots on the box floor: three across, two deep. Each piece sits a little askew, like it was placed by hand.
const TILT = [-3, 2, -1.5, 2.5, -2, 1.5];

const logoMask = (size = "contain"): CSSProperties => ({
  mask: `url(${LOGO}) center / ${size} no-repeat`,
  WebkitMask: `url(${LOGO}) center / ${size} no-repeat`,
});

/**
 * Build-your-own beauty box: a CSS 3D model of the Collavé mailer box (24 × 15 × 7 cm, from the dieline),
 * lined with Collavé tissue paper. Products chosen from the catalog drop into the box.
 */
export function BeautyBox({ t, lang, products, groups }: { t: Copy["box"]; lang: string; products: BoxProduct[]; groups: { id: string; name: string }[] }) {
  const member = useMember();
  const [chosen, setChosen] = useState<BoxProduct[]>([]);
  const [filter, setFilter] = useState("all");
  const [turn, setTurn] = useState(-28);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const drag = useRef<{ x: number; turn: number } | null>(null);
  const row = useRef<HTMLUListElement>(null);

  const euro = new Intl.NumberFormat(lang === "bg" ? "bg-BG" : "en-IE", { style: "currency", currency: "EUR" });
  const total = chosen.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const full = chosen.length >= CAPACITY;
  const shown = products.filter((p) => filter === "all" || p.group === filter);
  const inBox = (id: string) => chosen.some((c) => c.id === id);

  const toggle = (p: BoxProduct) => {
    setStatus("idle");
    setChosen((c) => (c.some((x) => x.id === p.id) ? c.filter((x) => x.id !== p.id) : c.length >= CAPACITY ? c : [...c, p]));
  };

  const clamp = (v: number) => Math.max(-75, Math.min(75, v));
  const onDown = (e: PointerEvent) => {
    drag.current = { x: e.clientX, turn };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (drag.current) setTurn(clamp(drag.current.turn + (e.clientX - drag.current.x) * 0.35));
  };
  const onUp = () => (drag.current = null);

  const send = async () => {
    if (!member) return askToJoin();
    setStatus("sending");
    const r = await requestBox({ name: member.name, email: member.email, products: chosen.map((c) => c.name), lang }).catch(() => ({ ok: false as const }));
    setStatus(r.ok ? "sent" : "failed");
  };

  const step = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div>
      {/* The box */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem] lg:items-center">
        <div className="min-w-0">
          <div
            className="bb-scene relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-hidden="true"
          >
            <div className="bb-box" style={{ "--turn": `${turn}deg` } as CSSProperties}>
              <div className="bb-shadow" />
              {/* Floor, lined with tissue paper printed with the Collavé mark */}
              <div className="bb-floor">
                <div className="bb-tissue">
                  <span className="bb-tissue-pattern" style={{ mask: `url(${LOGO}) 0 0 / 5.5em auto repeat`, WebkitMask: `url(${LOGO}) 0 0 / 5.5em auto repeat` }} />
                  <span className={`bb-seal ${chosen.length ? "opacity-0" : ""}`} style={logoMask()} />
                </div>
                {chosen.map((p, i) => (
                  <div
                    key={p.id}
                    className="bb-item"
                    style={{ "--col": i % 3, "--row": Math.floor(i / 3), "--tilt": `${TILT[i]}deg` } as CSSProperties}
                  >
                    <Image src={p.image} alt="" fill sizes="120px" className="object-cover" />
                  </div>
                ))}
              </div>
              {/* Walls: inside plain, outside printed like the dieline */}
              <div className="bb-wall bb-back">
                <div className="bb-face bb-in" />
                <div className="bb-face bb-out" />
              </div>
              <div className="bb-wall bb-front">
                <div className="bb-face bb-in" />
                <div className="bb-face bb-out bb-print">
                  <span className="bb-mark" style={logoMask()} />
                  <span className="bb-url">www.collave.bg</span>
                </div>
              </div>
              <div className="bb-wall bb-left">
                <div className="bb-face bb-in" />
                <div className="bb-face bb-out bb-print bb-print-side">
                  <span className="bb-mark" style={logoMask()} />
                </div>
              </div>
              <div className="bb-wall bb-right">
                <div className="bb-face bb-in" />
                <div className="bb-face bb-out bb-print bb-print-side">
                  <span className="bb-mark" style={logoMask()} />
                </div>
              </div>
              {/* Lid, open, with its front tuck flap */}
              <div className="bb-lid">
                <div className="bb-face bb-in bb-lid-in">
                  <span className="bb-mark bb-lid-mark" style={logoMask()} />
                </div>
                <div className="bb-face bb-out bb-print">
                  <span className="bb-mark" style={logoMask()} />
                </div>
                <div className="bb-lip">
                  <div className="bb-face bb-in" />
                  <div className="bb-face bb-out" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <button type="button" aria-label={t.left} onClick={() => setTurn((v) => clamp(v - 20))} className="btn-round">
              <RotateCcw className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <p className="text-soft min-w-0 px-2 text-center text-xs tracking-[0.2em] uppercase">{t.turn}</p>
            <button type="button" aria-label={t.right} onClick={() => setTurn((v) => clamp(v + 20))} className="btn-round">
              <RotateCw className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>

        {/* Your box */}
        <aside className="bg-mocha/10 p-6" aria-live="polite">
          {status === "sent" ? (
            <div role="status">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#b07778]/25">
                <Check className="size-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-light tracking-wide uppercase">{t.sentTitle}</h2>
              <p className="text-soft mt-2 text-sm">{t.sentBody}</p>
              <button
                type="button"
                onClick={() => {
                  setChosen([]);
                  setStatus("idle");
                }}
                className="btn-mocha mt-6 w-full"
              >
                {t.again}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xs tracking-[0.3em] uppercase">{t.dims.title}</h2>
                <p className="text-soft text-sm">
                  {chosen.length} {t.of} {CAPACITY} {t.products}
                </p>
              </div>
              <div className="bg-line mt-3 h-px">
                <div className="bg-ink h-px transition-[width] duration-300" style={{ width: `${(chosen.length / CAPACITY) * 100}%` }} />
              </div>
              {chosen.length ? (
                <ul className="mt-4 space-y-2">
                  {chosen.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 text-sm">
                      <span className="bg-mist relative h-10 w-8 shrink-0 overflow-hidden">
                        <Image src={p.image} alt="" fill sizes="32px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      <span className="shrink-0">{p.price}</span>
                      <button type="button" aria-label={`${t.remove}: ${p.name}`} onClick={() => toggle(p)} className="text-soft hover:text-ink -mr-3 inline-flex size-11 shrink-0 items-center justify-center">
                        <X className="size-4" strokeWidth={1.25} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-soft mt-4 text-sm">{t.empty}</p>
              )}
              <div className="border-line mt-4 flex justify-between border-t pt-4">
                <span className="text-sm tracking-wide uppercase">{t.total}</span>
                <span>{euro.format(total)}</span>
              </div>
              {status === "failed" ? (
                <p role="alert" className="mt-3 text-sm text-red-800">
                  {t.failed}
                </p>
              ) : null}
              <button type="button" disabled={!chosen.length || status === "sending"} onClick={send} className="btn-mocha mt-5 w-full disabled:opacity-40">
                {status === "sending" ? t.sending : t.cta}
              </button>
            </>
          )}
        </aside>
      </div>

      {/* The collection, in one line */}
      <section aria-labelledby="box-catalog" className="border-line mt-14 border-t pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="box-catalog" className="text-xs tracking-[0.3em] uppercase">
            {t.catalog}
          </h2>
          <div className="hidden gap-2 md:flex">
            <button type="button" aria-label={t.prev} onClick={() => step(-1)} className="btn-round">
              <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button type="button" aria-label={t.next} onClick={() => step(1)} className="btn-round">
              <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
        <div role="group" aria-label={t.catalog} className="rail mt-4 flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", name: t.all }, ...groups].map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={filter === g.id}
              onClick={() => {
                setFilter(g.id);
                row.current?.scrollTo({ left: 0 });
              }}
              className={`min-h-11 shrink-0 rounded-full border px-5 text-sm transition-colors duration-200 ${filter === g.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <ul ref={row} className="rail mt-6 flex snap-x gap-5 overflow-x-auto pb-3">
          {shown.map((p) => {
            const on = inBox(p.id);
            return (
              <li key={p.id} className="w-40 shrink-0 snap-start sm:w-44">
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(p)}
                  aria-label={`${on ? t.remove : t.add}: ${p.name}`}
                  className="group block w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className={`bg-mist relative block aspect-[4/5] overflow-hidden outline-offset-2 ${on ? "outline outline-2 outline-[#b07778]" : ""}`}>
                    <Image src={p.image} alt="" fill sizes="176px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    <span className={`absolute right-2 bottom-2 inline-flex size-9 items-center justify-center rounded-full transition-colors duration-200 ${on ? "bg-[#b07778] text-white" : "bg-cream/90 text-ink"}`}>
                      {on ? <Check className="size-4" strokeWidth={1.5} aria-hidden /> : <Plus className="size-4" strokeWidth={1.5} aria-hidden />}
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-snug">{p.name}</span>
                  <span className="text-soft block text-sm">{on ? t.added : !on && full ? t.full : p.price}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
