"use client";

import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useState, type FormEvent } from "react";

import { bookAppointment } from "@/app/actions/book";
import type { Copy } from "@/lib/copy";
import { BOOK_AHEAD_DAYS, dayKey, OPENING, slotsFor } from "@/lib/hours";
import { signIn, useMember } from "@/lib/member";
import { EMAIL, isPhone } from "@/lib/validate";

const BOOKINGS = "collave-bookings";

type Errors = Partial<Record<"name" | "surname" | "email" | "phone" | "password" | "terms" | "pick" | "server", string>>;
type Booking = { date: string; time: string };

const readBookings = (): Booking[] => {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS) ?? "[]");
  } catch {
    return [];
  }
};

/** Calendar of free times from the opening hours, then confirm (members) or create an account first. */
export function Booking({ t, club, lang }: { t: Copy["book"]; club: Copy["club"]; lang: string }) {
  const member = useMember();
  const id = useId();
  // Dates are worked out in the browser so they follow the visitor's clock.
  const [now, setNow] = useState<Date | null>(null);
  const [month, setMonth] = useState(0); // 0 = this month
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<Booking[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState<Booking | null>(null);

  useEffect(() => {
    setNow(new Date());
    setTaken(readBookings());
  }, []);

  const locale = lang === "bg" ? "bg-BG" : "en-GB";

  const grid = useMemo(() => {
    if (!now) return null;
    const first = new Date(now.getFullYear(), now.getMonth() + month, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + BOOK_AHEAD_DAYS);
    const lead = (first.getDay() + 6) % 7; // Monday first
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: ({ date: Date; open: boolean } | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) {
      const date = new Date(first.getFullYear(), first.getMonth(), d);
      const inRange = date <= last && date >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
      cells.push({ date, open: inRange && slotsFor(date, now).length > 0 });
    }
    return {
      title: first.toLocaleDateString(locale, { month: "long", year: "numeric" }),
      cells,
      canNext: new Date(first.getFullYear(), first.getMonth() + 1, 1) <= last,
    };
  }, [now, month, locale]);

  const selected = day ? new Date(`${day}T00:00`) : null;
  const slots = selected && now ? slotsFor(selected, now).filter((s) => !taken.some((b) => b.date === day && b.time === s)) : [];
  const longDay = (key: string) => new Date(`${key}T00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = member?.name ?? (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = member?.email ?? (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const next: Errors = {};
    if (!day || !time) next.pick = t.pick;
    const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
    if (!member) {
      if (!name) next.name = t.errors.name;
      if (!field("surname")?.value.trim()) next.surname = club.surnameError;
      if (!EMAIL.test(email)) next.email = t.errors.email;
      if (!isPhone(field("phone")?.value ?? "")) next.phone = club.phoneError;
      if ((field("password")?.value.length ?? 0) < 8) next.password = club.passwordError;
      if (!field("terms")?.checked) next.terms = club.consentError;
    }
    setErrors(next);
    const first = (["name", "surname", "email", "phone", "password", "terms"] as const).find((k) => next[k]);
    if (first) {
      field(first)?.focus();
      return;
    }
    if (next.pick || !day || !time) return;

    setSending(true);
    const consent = member ? undefined : { terms: true, marketing: !!field("marketing")?.checked };
    const result = await bookAppointment({ name, surname: member?.surname ?? field("surname")?.value.trim(), email, phone: member?.phone ?? field("phone")?.value.trim(), date: day, time, lang, consent }).catch(() => ({ ok: false as const }));
    setSending(false);
    if (!result.ok) {
      setErrors({ server: t.errors.server });
      return;
    }
    if (!member) signIn({ name, surname: field("surname")?.value.trim(), email, phone: field("phone")?.value.trim(), marketing: !!field("marketing")?.checked, since: new Date().toISOString() });
    const b = { date: day, time };
    const all = [...readBookings(), b];
    try {
      localStorage.setItem(BOOKINGS, JSON.stringify(all));
    } catch {}
    setTaken(all);
    setBooked(b);
    setDay(null);
    setTime(null);
  };

  if (booked) {
    return (
      <div role="status" className="border-line mx-auto max-w-lg border p-8 text-center md:p-12">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-[#b07778]/25">
          <Check className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-light tracking-wide uppercase">{t.bookedTitle}</h2>
        <p className="mt-3 text-lg first-letter:uppercase">
          {longDay(booked.date)} · {booked.time}
        </p>
        <p className="text-soft mt-2">{t.bookedBody}</p>
        <button type="button" onClick={() => setBooked(null)} className="btn-mocha mt-8 w-auto px-8">
          {t.another}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div>
        {/* Day */}
        <fieldset className="max-w-xl">
          <legend className="text-soft text-xs tracking-[0.3em] uppercase">{t.day}</legend>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-light capitalize" aria-live="polite">
              {grid?.title ?? " "}
            </p>
            <div className="flex gap-1">
              <button type="button" aria-label={t.prev} disabled={month === 0} onClick={() => setMonth((m) => m - 1)} className="border-line inline-flex size-11 items-center justify-center border disabled:opacity-30">
                <ChevronLeft className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
              <button type="button" aria-label={t.next} disabled={!grid?.canNext} onClick={() => setMonth((m) => m + 1)} className="border-line inline-flex size-11 items-center justify-center border disabled:opacity-30">
                <ChevronRight className="size-4" strokeWidth={1.25} aria-hidden />
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-0.5 text-center sm:gap-1">
            {t.weekdays.map((w, i) => (
              <span key={w} aria-hidden="true" className={`text-soft pb-2 text-xs tracking-wide uppercase ${OPENING[(i + 1) % 7] ? "" : "opacity-50"}`}>
                {w}
              </span>
            ))}
            {grid
              ? grid.cells.map((c, i) =>
                  c ? (
                    <button
                      key={dayKey(c.date)}
                      type="button"
                      disabled={!c.open}
                      aria-pressed={day === dayKey(c.date)}
                      aria-label={`${longDay(dayKey(c.date))}${c.open ? "" : ` · ${t.closed}`}`}
                      onClick={() => {
                        setDay(dayKey(c.date));
                        setTime(null);
                        setErrors({});
                      }}
                      className={`h-11 text-[0.9375rem] transition-colors duration-200 disabled:cursor-default disabled:opacity-25 ${
                        day === dayKey(c.date) ? "bg-ink text-white" : c.open ? "hover:bg-mocha/15" : ""
                      }`}
                    >
                      {c.date.getDate()}
                    </button>
                  ) : (
                    <span key={`blank-${i}`} aria-hidden="true" />
                  ),
                )
              : Array.from({ length: 35 }, (_, i) => <span key={i} className="bg-mocha/10 h-11 animate-pulse" />)}
          </div>
        </fieldset>

        {/* Time */}
        <fieldset className="border-line mt-10 border-t pt-8">
          <legend className="text-soft float-left w-full text-xs tracking-[0.3em] uppercase">{t.time}</legend>
          <div className="clear-both pt-4">
            {day ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={time === s}
                    onClick={() => {
                      setTime(s);
                      setErrors({});
                    }}
                    className={`min-h-11 border text-[0.9375rem] transition-colors duration-200 ${time === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-soft">{t.noDay}</p>
            )}
          </div>
        </fieldset>
      </div>

      {/* Summary and confirm */}
      <aside className="bg-mocha/10 h-fit p-6 lg:sticky lg:top-20">
        <h2 className="text-xs tracking-[0.3em] uppercase">{t.summary}</h2>
        <p className="mt-3 min-h-14 text-lg font-light first-letter:uppercase">
          {day ? longDay(day) : "—"}
          {time ? <span className="block">{time}</span> : null}
        </p>

        {member ? (
          <p className="border-line mt-4 border-t pt-4 text-sm">
            <span className="text-soft">{t.bookingAs}</span> {[member.name, member.surname].filter(Boolean).join(" ")} · {member.email}
          </p>
        ) : (
          <div className="border-line mt-4 space-y-3 border-t pt-4">
            <p className="text-sm">{t.account}</p>
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-name`} className="sr-only">
                {club.name}
              </label>
              <input
                id={`${id}-name`}
                name="name"
                autoComplete="given-name"
                placeholder={club.name}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
                className="border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none"
              />
              {errors.name ? (
                <p id={`${id}-name-error`} className="mt-1 text-sm text-red-800">
                  {errors.name}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${id}-surname`} className="sr-only">
                {club.surname}
              </label>
              <input
                id={`${id}-surname`}
                name="surname"
                autoComplete="family-name"
                placeholder={club.surname}
                aria-invalid={errors.surname ? true : undefined}
                aria-describedby={errors.surname ? `${id}-surname-error` : undefined}
                className="border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none"
              />
              {errors.surname ? (
                <p id={`${id}-surname-error`} className="mt-1 text-sm text-red-800">
                  {errors.surname}
                </p>
              ) : null}
            </div>
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="sr-only">
                {club.email}
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="email"
                placeholder={club.email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? `${id}-email-error` : undefined}
                className="border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none"
              />
              {errors.email ? (
                <p id={`${id}-email-error`} className="mt-1 text-sm text-red-800">
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${id}-phone`} className="sr-only">
                {club.phone}
              </label>
              <input
                id={`${id}-phone`}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={club.phone}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
                className="border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none"
              />
              {errors.phone ? (
                <p id={`${id}-phone-error`} className="mt-1 text-sm text-red-800">
                  {errors.phone}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor={`${id}-password`} className="sr-only">
                {club.password}
              </label>
              <input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={`${club.password} · ${club.passwordHint}`}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? `${id}-password-error` : undefined}
                className="border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none"
              />
              {errors.password ? (
                <p id={`${id}-password-error`} className="mt-1 text-sm text-red-800">
                  {errors.password}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 pt-1 text-sm">
              <label className="flex cursor-pointer items-start gap-3">
                <input name="terms" type="checkbox" aria-invalid={errors.terms ? true : undefined} aria-describedby={errors.terms ? `${id}-terms-error` : undefined} className="accent-ink mt-0.5 size-5 shrink-0" />
                <span>
                  {club.consentTerms}{" "}
                  <a href={`/${lang}/info/legal`} target="_blank" className="underline underline-offset-4">
                    {club.consentLink}
                  </a>
                </span>
              </label>
              {errors.terms ? (
                <p id={`${id}-terms-error`} className="text-sm text-red-800">
                  {errors.terms}
                </p>
              ) : null}
              <label className="flex cursor-pointer items-start gap-3">
                <input name="marketing" type="checkbox" className="accent-ink mt-0.5 size-5 shrink-0" />
                <span className="text-soft">{club.consentMarketing}</span>
              </label>
            </div>
          </div>
        )}

        {errors.pick || errors.server ? (
          <p role="alert" className="mt-4 text-sm text-red-800">
            {errors.pick ?? errors.server}
          </p>
        ) : null}
        <button type="submit" disabled={sending} className="btn-mocha mt-5 disabled:opacity-60">
          {sending ? t.sending : t.confirm}
        </button>
        <p className="text-soft mt-4 text-sm">
          {t.mail}{" "}
          <a href={`mailto:${t.mailAddress}`} className="text-ink underline underline-offset-4">
            {t.mailAddress}
          </a>
        </p>
      </aside>
    </form>
  );
}
