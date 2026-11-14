"use client";

import { useId, useState, type FormEvent } from "react";

import { joinNewsletter } from "@/app/actions/help";
import type { Copy } from "@/lib/copy";
import { EMAIL } from "@/lib/validate";

/** Footer newsletter sign-up (also how people subscribe again after unsubscribing). */
export function Newsletter({ t, lang }: { t: Copy["help"]["newsletter"]; lang: string }) {
  const id = useId();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (!EMAIL.test(email)) return setError(t.error);
    setError("");
    setSending(true);
    const r = await joinNewsletter(email, lang).catch(() => ({ ok: false as const }));
    setSending(false);
    if (r.ok) setDone(true);
    else setError(t.error);
  };

  return (
    <section id="newsletter" aria-labelledby={`${id}-title`} className="border-white/25 grid gap-4 border-b pb-10 md:grid-cols-2 md:items-end md:gap-10">
      <div>
        <h2 id={`${id}-title`} className="text-sm tracking-wide uppercase">
          {t.title}
        </h2>
        <p className="mt-1">{t.lead}</p>
      </div>
      {done ? (
        <p role="status">{t.done}</p>
      ) : (
        <form noValidate onSubmit={onSubmit}>
          <div className="flex gap-2">
            <label htmlFor={`${id}-email`} className="sr-only">
              {t.email}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t.email}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className="min-h-11 min-w-0 flex-1 border border-white/50 bg-white/10 px-3 text-base text-white outline-none placeholder:text-white/70 focus:border-white"
            />
            <button type="submit" disabled={sending} className="btn shrink-0 border border-white/70 bg-white/10 px-6 text-white hover:bg-white hover:text-ink disabled:opacity-60">
              {t.submit}
            </button>
          </div>
          {error ? (
            <p id={`${id}-error`} className="mt-1 text-sm text-[#ffd9cc]">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
