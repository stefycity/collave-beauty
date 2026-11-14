"use client";

import { ArrowLeft, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { Group, Item } from "@/lib/menu";

interface ShelfProps {
  id: string;
  title: string;
  subtitle: string;
  groups: Group[];
  labels: { details: string; prev: string; next: string; close: string };
}

/** Same layout as the original Collavé site: three across, name and price centred beneath. */
export function Shelf({ id, title, subtitle, groups, labels }: ShelfProps) {
  const [groupId, setGroupId] = useState(groups[0]?.id);
  const [selected, setSelected] = useState<Item | null>(null);
  const rail = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const items = groups.find((g) => g.id === groupId)?.items ?? [];

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector("li");
    if (el && card) el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 32), behavior: "smooth" });
  };

  const show = (item: Item) => {
    setSelected(item);
    dialog.current?.showModal();
  };

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="grid gap-3 md:grid-cols-2 md:items-end md:gap-10">
          <h2 id={`${id}-title`} className="title-thin text-heading">
            {title}
          </h2>
          <p className="md:text-right">{subtitle}</p>
        </header>

        {groups.length > 1 ? (
          <div role="group" aria-label={title} className="rail mt-8 flex gap-6 overflow-x-auto text-sm">
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
        ) : null}

        <ul key={groupId} ref={rail} className="rail mt-8 flex snap-x snap-mandatory gap-8 overflow-x-auto pb-2">
          {items.map((item) => (
            <li key={item.id} className="w-[72vw] shrink-0 snap-start sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]">
              <button
                type="button"
                onClick={() => show(item)}
                aria-haspopup="dialog"
                aria-label={`${labels.details}: ${item.name}`}
                className="group block w-full text-center"
              >
                <span className="relative block aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 72vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </span>
                <span className="mt-4 block text-[0.9375rem]">{item.name}</span>
                <span className="text-soft mt-1 block text-sm">{item.price ?? item.size ?? item.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-center gap-2">
          <button type="button" aria-label={labels.prev} onClick={() => step(-1)} className="btn-round">
            <ArrowLeft className="size-4" strokeWidth={1.25} aria-hidden />
          </button>
          <button type="button" aria-label={labels.next} onClick={() => step(1)} className="btn-round">
            <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden />
          </button>
        </div>
      </div>

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
            <div className="relative aspect-[4/5] sm:aspect-auto">
              <Image src={selected.image} alt={selected.name} fill sizes="(min-width: 640px) 22rem, 100vw" className="object-cover" />
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
