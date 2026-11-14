"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Group, Item } from "@/lib/menu";
import { askToJoin, toggleSaved, useMember, useWishlist } from "@/lib/member";

interface RailProps {
  id: string;
  title: string;
  groups: Group[];
  columns: 3 | 4;
  /** Drinks: a coloured card with price tab, strip, name and ingredient chips. */
  drinkCard?: { strip: string; action: { href: string; label: string } };
  labels: { details: string; prev: string; next: string; close: string };
  allLabels?: { all: string; less: string };
  /** A short feature: intro text beside the products, no tabs or arrows. */
  intro?: { eyebrow: string; lead: string };
  /** Beauty products: a heart to save them to the member's wish list. */
  wish?: { save: string; unsave: string };
}

const WIDTHS = {
  3: "w-[72vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]",
  4: "w-[62vw] sm:w-[calc((100%-1.5rem)/2)] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]",
};

function DrinkCard({ item, strip, action }: { item: Item; strip: string; action: { href: string; label: string } }) {
  const tint = item.tint ?? { panel: "#ecdfcc", strip: "#7f6a4f" };
  // Recipe lines read "Espresso · 7 g"; the card only names the ingredient.
  const chips = (item.details[0]?.items ?? []).map((c) => c.split(" · ")[0]);
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] bg-white p-3 shadow-[0_18px_40px_-28px_rgba(68,39,18,0.3)]">
      <div className="relative overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: tint.panel }}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 72vw"
            className={`mix-blend-multiply ${item.tall ? "scale-[1.32] object-contain" : "scale-110 object-cover"}`}
          />
        </div>
        <p className="px-3 py-1.5 text-center text-xs text-white" style={{ backgroundColor: tint.strip }}>
          {[item.size, item.noCollagen ? null : strip].filter(Boolean).join(" · ")}
        </p>
        {item.price ? <span className="drink-price">{item.price}</span> : null}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[1.375rem] leading-tight font-light">{item.name}</h3>
          <a href={action.href} className="inline-flex min-h-11 shrink-0 items-start gap-0.5 pt-1 text-sm underline underline-offset-4 hover:opacity-70">
            {action.label}
            <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
          </a>
        </div>
        <ul aria-label={item.details[0]?.label} className="mt-1 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li key={c} className="rounded-full px-2.5 py-1 text-xs" style={{ backgroundColor: `${tint.panel}99` }}>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function Rail({ id, title, groups, columns, drinkCard, labels, allLabels, intro, wish }: RailProps) {
  const member = useMember();
  const saved = useWishlist();
  const [groupId, setGroupId] = useState(groups[0]?.id);

  // Links like /en#beauty-face (from the header) open this section on that category.
  useEffect(() => {
    const fromHash = () => {
      const g = groups.find((x) => window.location.hash === `#${id}-${x.id}`);
      if (!g) return;
      setGroupId(g.id);
      setAll(false);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [groups, id]);
  const [all, setAll] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);
  const rail = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const items = groups.find((g) => g.id === groupId)?.items ?? [];

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector("li");
    if (el && card) el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  };

  const show = (item: Item) => {
    setSelected(item);
    dialog.current?.showModal();
  };

  const card = (item: Item) => (
    <article className="flex h-full flex-col">
      <div className="bg-mist relative aspect-[4/5] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={columns === 3 ? "(min-width: 1024px) 30vw, 72vw" : "(min-width: 1024px) 23vw, 62vw"}
          className="object-cover"
        />
        {wish ? <WishButton item={item} on={saved.some((s) => s.id === item.id)} member={!!member} labels={wish} /> : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className={columns === 3 ? "text-[1.0625rem]" : "text-[0.9375rem]"}>{item.name}</h3>
        {item.price ? <p className={`shrink-0 ${columns === 3 ? "text-[1.0625rem]" : "text-[0.9375rem]"}`}>{item.price}</p> : null}
      </div>
      <p className="text-soft mt-0.5 mb-3 text-sm">{item.subtitle}</p>
      <button type="button" onClick={() => show(item)} aria-haspopup="dialog" aria-label={`${labels.details}: ${item.name}`} className={`${intro ? "btn-rose" : "btn-line"} mt-auto`}>
        {labels.details}
      </button>
    </article>
  );

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-14 md:py-20">
      {intro ? (
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-3 lg:gap-6">
          <header className="max-w-md lg:pt-12 lg:pr-8">
            <p className="text-soft text-sm tracking-wide uppercase">{intro.eyebrow}</p>
            <h2 id={`${id}-title`} className="text-heading mt-3 font-light tracking-wide uppercase">
              {title}
            </h2>
            <p className="text-soft mt-4">{intro.lead}</p>
          </header>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:col-span-2">
            {groups.flatMap((g) => g.items).map((item) => (
              <li key={item.id}>{card(item)}</li>
            ))}
          </ul>
        </div>
      ) : (
      <div className="mx-auto max-w-6xl px-6">
        <header className="flex items-center justify-between gap-4">
          <h2 id={`${id}-title`} className="title-thin text-heading">
            {title}
          </h2>
          {allLabels ? (
            <button type="button" aria-expanded={all} onClick={() => setAll((a) => !a)} className="btn-sand shrink-0">
              {all ? allLabels.less : allLabels.all}
            </button>
          ) : null}
        </header>

        <div role="group" aria-label={title} className="rail mt-4 flex gap-6 overflow-x-auto text-sm tracking-wide uppercase">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={g.id === groupId}
              onClick={() => {
                setGroupId(g.id);
                rail.current?.scrollTo({ left: 0 });
              }}
              className={`min-h-11 shrink-0 underline-offset-4 ${g.id === groupId ? "underline" : "text-soft hover:text-ink"}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {all ? (
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
            {groups.flatMap((g) => g.items).map((item) => (
              <li key={item.id}>{card(item)}</li>
            ))}
          </ul>
        ) : (
          <div className="relative mt-5">
            <ul ref={rail} className="rail flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
              {items.map((item) => (
                <li key={item.id} className={`shrink-0 snap-start ${WIDTHS[columns]}`}>
                  {drinkCard ? <DrinkCard item={item} strip={drinkCard.strip} action={drinkCard.action} /> : card(item)}
                </li>
              ))}
            </ul>
            <button type="button" aria-label={labels.prev} onClick={() => step(-1)} className="text-soft hover:text-ink absolute top-[35%] -left-11 hidden size-11 items-center justify-center xl:inline-flex">
              <ChevronLeft className="size-6" strokeWidth={1.25} aria-hidden />
            </button>
            <button type="button" aria-label={labels.next} onClick={() => step(1)} className="hover:text-soft absolute top-[35%] -right-11 hidden size-11 items-center justify-center xl:inline-flex">
              <ChevronRight className="size-6" strokeWidth={1.25} aria-hidden />
            </button>
            <div className="mt-4 flex justify-center gap-2 xl:hidden">
              <button type="button" aria-label={labels.prev} onClick={() => step(-1)} className="btn-round">
                <ChevronLeft className="size-5" strokeWidth={1.25} aria-hidden />
              </button>
              <button type="button" aria-label={labels.next} onClick={() => step(1)} className="btn-round">
                <ChevronRight className="size-5" strokeWidth={1.25} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      <dialog
        ref={dialog}
        aria-label={selected?.name}
        className="bg-cream text-ink m-auto max-h-[90svh] w-[min(100%-2rem,44rem)] overflow-y-auto p-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        {selected ? (
          <div className="grid sm:grid-cols-2">
            <div className="bg-mist relative aspect-[4/5] sm:aspect-auto">
              <Image src={selected.image} alt="" fill sizes="(min-width: 640px) 22rem, 100vw" className="object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl">{selected.name}</h3>
                <button type="button" aria-label={labels.close} onClick={() => dialog.current?.close()} className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center">
                  <X className="size-5" strokeWidth={1.25} aria-hidden />
                </button>
              </div>
              <p className="text-soft mt-1">{selected.subtitle}</p>
              <p className="mt-2">{[selected.price, selected.size].filter(Boolean).join(" · ")}</p>
              {selected.details.map((d) => (
                <div key={d.label} className="border-line mt-5 border-t pt-4">
                  <h4 className="text-sm tracking-wide uppercase">{d.label}</h4>
                  <ul className="mt-2 space-y-1 text-[0.9375rem]">
                    {d.items.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}

function WishButton({ item, on, member, labels }: { item: Item; on: boolean; member: boolean; labels: { save: string; unsave: string } }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? labels.unsave : labels.save}: ${item.name}`}
      onClick={() =>
        member
          ? toggleSaved({ id: item.id, name: item.name, subtitle: item.subtitle, price: item.price, image: item.image })
          : askToJoin()
      }
      className="bg-cream/80 absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-full backdrop-blur transition-colors duration-200 hover:bg-cream"
    >
      <Heart
        className={`size-[1.125rem] transition-transform duration-200 ${on ? "scale-110 fill-[#b07778] text-[#b07778]" : ""}`}
        strokeWidth={1.25}
        aria-hidden
      />
    </button>
  );
}
