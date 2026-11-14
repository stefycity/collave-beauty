"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type FormEvent } from "react";

import { sendInquiry } from "@/app/actions/inquiry";
import type { Copy } from "@/lib/copy";

type Errors = Partial<Record<"name" | "email" | "type" | "guests", string>>;
type Status = "idle" | "sending" | "sent" | "error";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Rooms({ t, form: f, lang }: { t: Copy["rooms"]; form: Copy["form"]; lang: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const id = useId();

  const open = (preset?: string) => {
    if (preset) setType(preset);
    if (status === "sent") setStatus("idle");
    dialog.current?.showModal();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const found: Errors = {};
    const guests = Number(data.get("guests"));
    if (!String(data.get("name") ?? "").trim()) found.name = f.errors.name;
    if (!EMAIL.test(String(data.get("email") ?? "").trim())) found.email = f.errors.email;
    if (!data.get("type")) found.type = f.errors.type;
    if (data.get("type") !== "gift-card" && !(guests >= 1 && guests <= 200)) found.guests = f.errors.guests;
    setErrors(found);
    const first = (["name", "email", "type", "guests"] as const).find((k) => found[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    const result = await sendInquiry({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone") ?? ""),
      type: String(data.get("type")),
      date: String(data.get("date") ?? ""),
      guests,
      message: String(data.get("message") ?? ""),
      lang,
    }).catch(() => ({ ok: false as const }));
    if (result.ok) {
      setStatus("sent");
      form.reset();
      setType("");
    } else {
      setStatus("error");
    }
  };

  const field = (name: keyof Errors) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    className: `mt-1 block min-h-11 w-full border bg-white px-3 outline-none focus:border-ink ${errors[name] ? "border-red-700" : "border-line"}`,
  });

  const errorText = (name: keyof Errors) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-sm text-red-800">
        {errors[name]}
      </p>
    ) : null;

  const plain = "border-line focus:border-ink mt-1 block min-h-11 w-full border bg-white px-3 outline-none";

  return (
    <section id="rooms" aria-labelledby="rooms-title" className="pt-14 md:pt-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-soft text-xs tracking-[0.3em] uppercase">{t.eyebrow}</p>
          <h2 id="rooms-title" className="text-display mt-3 font-light tracking-wide uppercase">
            {t.title}
          </h2>
          <p className="text-soft mx-auto mt-4 max-w-xl">{t.lead}</p>
        </header>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {t.cards.map((c) => (
            <li key={c.type} id={`service-${c.type}`} className="scroll-mt-20">
              <article>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={c.image} alt={c.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <h3 className="mt-4 text-[1.0625rem]">{c.title}</h3>
                <p className="text-soft mt-1 text-[0.9375rem] leading-relaxed">{c.body}</p>
                {c.type === "appointment" ? (
                  <a href={`/${lang}/book`} className="mt-2 inline-flex min-h-11 items-center text-sm tracking-wide uppercase underline underline-offset-4">
                    {"cta" in c ? c.cta : t.cardCta}
                  </a>
                ) : (
                  <button type="button" onClick={() => open(c.type)} className="mt-2 inline-flex min-h-11 items-center text-sm tracking-wide uppercase underline underline-offset-4">
                    {"cta" in c ? c.cta : t.cardCta}
                  </button>
                )}
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* Events banner: the inquiry button sits on the photo. */}
      <div id="events" className="relative isolate mt-14 flex min-h-[70svh] scroll-mt-14 items-center justify-center overflow-hidden px-6 py-20 text-center text-white md:mt-20">
        <Image src="/site/events-wide.webp" alt={t.banner.alt} fill sizes="100vw" className="-z-20 object-cover object-[50%_12%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />
        <div className="max-w-xl">
          <h2 className="text-[clamp(1.75rem,1.3rem+1.8vw,3rem)] leading-[1.1] font-light">{t.banner.title}</h2>
          <p className="mx-auto mt-4 max-w-md">{t.banner.sub}</p>
          <button
            type="button"
            onClick={() => open()}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-white/80 px-7 text-sm transition-colors duration-200 hover:bg-white hover:text-ink"
          >
            {t.cta}
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        className="bg-cream text-ink m-auto max-h-[90svh] w-[min(100%-2rem,32rem)] overflow-y-auto p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id={`${id}-title`} className="text-xl">
            {status === "sent" ? f.successTitle : f.title}
          </h3>
          <button type="button" aria-label={f.close} onClick={() => dialog.current?.close()} className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center">
            <X className="size-5" strokeWidth={1.25} aria-hidden />
          </button>
        </div>
        {status === "sent" ? (
          <div role="status" className="mt-2">
            <p>{f.successBody}</p>
            <button type="button" onClick={() => dialog.current?.close()} className="btn-sand mt-5">
              {f.close}
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="mt-2">
            <p className="text-soft">{f.intro}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-name`} className="text-sm">{f.name} *</label>
                <input {...field("name")} type="text" autoComplete="name" required />
                {errorText("name")}
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="text-sm">{f.email} *</label>
                <input {...field("email")} type="email" autoComplete="email" required />
                {errorText("email")}
              </div>
              <div>
                <label htmlFor={`${id}-phone`} className="text-sm">{f.phone}</label>
                <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" className={plain} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-type`} className="text-sm">{f.type} *</label>
                <select {...field("type")} required value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="" disabled>{f.choose}</option>
                  {Object.entries(f.types).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errorText("type")}
              </div>
              {type === "gift-card" ? null : (
                <>
              <div>
                <label htmlFor={`${id}-date`} className="text-sm">{f.date}</label>
                <input id={`${id}-date`} name="date" type="date" className={plain} />
              </div>
              <div>
                <label htmlFor={`${id}-guests`} className="text-sm">{f.guests} *</label>
                <input {...field("guests")} type="number" min={1} required />
                {errorText("guests")}
              </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-message`} className="text-sm">{f.message}</label>
                <textarea id={`${id}-message`} name="message" rows={3} className={`${plain} py-2`} />
              </div>
            </div>
            {status === "error" ? <p role="alert" className="mt-3 text-sm text-red-800">{f.errors.server}</p> : null}
            <button type="submit" disabled={status === "sending"} className="btn mt-5 w-full bg-ink text-white hover:bg-soft disabled:opacity-60">
              {status === "sending" ? f.sending : f.submit}
            </button>
          </form>
        )}
      </dialog>
    </section>
  );
}

