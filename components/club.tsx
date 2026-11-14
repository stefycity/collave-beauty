"use client";

import { User, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { joinClub } from "@/app/actions/club";
import { requestPasswordReset } from "@/app/actions/help";
import type { Copy } from "@/lib/copy";
import { findAccount, openView, signIn, useMember } from "@/lib/member";
import { EMAIL, isPhone } from "@/lib/validate";


type Mode = "signin" | "signup" | "forgot";
type Field = "name" | "surname" | "email" | "phone" | "password" | "terms";
type Errors = Partial<Record<Field | "form", string>>;

/**
 * Header account button. Visitors choose Sign in or Create account; members go straight
 * to their account pages (see account.tsx).
 *
 * TODO: real accounts. Passwords are checked for length only and never stored; sign-in
 * only finds accounts created on this device. Swap for the shop's sign-in when it exists.
 * Consent wording is a placeholder until legal sends the final text.
 */
export function Club({ t, lang, forgot }: { t: Copy["club"]; lang: string; forgot: Copy["help"]["forgot"] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const member = useMember();
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Other parts of the site open this panel on a given step (hearts, help pages).
    const onOpen = (e: Event) => {
      setMode((e as CustomEvent<Mode>).detail ?? "signin");
      setErrors({});
      setResetSent(false);
      setOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("collave:account", onOpen);
    return () => window.removeEventListener("collave:account", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const choose = (m: Mode) => {
    setMode(m);
    setErrors({});
    setResetSent(false);
  };

  const onReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (!EMAIL.test(email)) {
      setErrors({ email: t.error });
      return;
    }
    setErrors({});
    setSending(true);
    await requestPasswordReset(email).catch(() => null);
    setSending(false);
    setResetSent(true);
  };

  const done = () => {
    setOpen(false);
    openView("profile");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? "";
    const checked = (n: string) => !!(form.elements.namedItem(n) as HTMLInputElement | null)?.checked;
    const name = value("name");
    const surname = value("surname");
    const email = value("email");
    const phone = value("phone");
    const password = value("password");

    const next: Errors = {};
    if (mode === "signup" && !name) next.name = t.nameError;
    if (mode === "signup" && !surname) next.surname = t.surnameError;
    if (!EMAIL.test(email)) next.email = t.error;
    if (mode === "signup" && !isPhone(phone)) next.phone = t.phoneError;
    if (password.length < 8) next.password = t.passwordError;
    if (mode === "signup" && !checked("terms")) next.terms = t.consentError;
    setErrors(next);
    const first = (["name", "surname", "email", "phone", "password", "terms"] as const).find((k) => next[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLInputElement).focus();
      return;
    }

    if (mode === "signin") {
      const account = findAccount(email);
      if (!account) {
        setErrors({ form: t.notFound });
        return;
      }
      signIn(account);
      done();
      return;
    }

    setSending(true);
    const marketing = checked("marketing");
    const result = await joinClub({ name, surname, email, phone }, lang, { terms: true, marketing }).catch(() => ({ ok: false as const }));
    setSending(false);
    if (!result.ok) {
      setErrors({ form: t.failed });
      return;
    }
    signIn({ name, surname, email, phone, marketing, since: new Date().toISOString() });
    done();
  };

  const field = "border-ink/40 focus:border-ink min-h-11 w-full border bg-white px-3 text-base outline-none";
  const describe = (k: Field) => (errors[k] ? `${id}-${k}-error` : undefined);
  const errorText = (k: Field) =>
    errors[k] ? (
      <p id={`${id}-${k}-error`} className="mt-1 text-sm text-red-800">
        {errors[k]}
      </p>
    ) : null;

  const signup = mode === "signup";

  return (
    <div ref={root}>
      <button
        ref={button}
        type="button"
        aria-label={t.open}
        aria-expanded={member ? undefined : open}
        aria-controls={member ? undefined : `${id}-panel`}
        onClick={() => {
          if (member) return openView("profile");
          if (!open) choose("signin");
          setOpen((o) => !o);
        }}
        className="relative inline-flex size-11 items-center justify-center"
      >
        <User className="size-5" strokeWidth={1.5} aria-hidden />
        {member ? <span aria-hidden="true" className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-[#b07778]" /> : null}
      </button>

      {open && !member ? (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-title`}
          className="club-in bg-cream text-ink border-line absolute top-full right-4 left-4 z-50 max-h-[calc(100svh-4.5rem)] overflow-y-auto border p-5 text-base normal-case shadow-[0_18px_40px_-20px_rgba(68,39,18,0.35)] sm:left-auto sm:w-[23rem] md:right-8"
        >
          <button type="button" aria-label={t.close} onClick={() => setOpen(false)} className="absolute top-1 right-1 inline-flex size-11 items-center justify-center">
            <X className="size-4" strokeWidth={1.25} aria-hidden />
          </button>
          <p className="text-soft pr-8 text-xs tracking-[0.2em] uppercase">{t.label}</p>

          {mode === "forgot" ? (
            <div>
              <h2 id={`${id}-title`} className="mt-4 text-lg font-light tracking-wide uppercase">
                {forgot.title}
              </h2>
              {resetSent ? (
                <p role="status" className="mt-2 text-sm">
                  {forgot.done}
                </p>
              ) : (
                <form noValidate onSubmit={onReset} className="mt-2 space-y-3">
                  <p className="text-soft text-sm">{forgot.lead}</p>
                  <div>
                    <label htmlFor={`${id}-reset`} className="sr-only">
                      {t.email}
                    </label>
                    <input id={`${id}-reset`} name="email" type="email" autoComplete="email" placeholder={t.email} aria-invalid={errors.email ? true : undefined} aria-describedby={describe("email")} className={field} />
                    {errorText("email")}
                  </div>
                  <button type="submit" disabled={sending} className="btn-mocha w-full disabled:opacity-60">
                    {sending ? t.sending : forgot.submit}
                  </button>
                </form>
              )}
              <button type="button" onClick={() => choose("signin")} className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                {forgot.back}
              </button>
            </div>
          ) : (
            <>
          {/* Two options: sign in or create an account. */}
          <div role="group" aria-label={t.account} className="border-line mt-4 grid grid-cols-2 border">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => choose(m)}
                className={`min-h-11 text-sm tracking-wide uppercase transition-colors duration-200 ${mode === m ? "bg-ink text-white" : "hover:bg-mocha/15"}`}
              >
                {m === "signin" ? t.signInTab : t.signUpTab}
              </button>
            ))}
          </div>

          <h2 id={`${id}-title`} className="mt-5 text-lg font-light tracking-wide uppercase">
            {signup ? t.signUpTitle : t.signInTitle}
          </h2>
          <p className="text-soft mt-1 text-sm">{signup ? t.signUpBody : t.signInBody}</p>

          <form key={mode} noValidate onSubmit={onSubmit} className="mt-4 space-y-3">
            {signup ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`${id}-name`} className="sr-only">
                    {t.name}
                  </label>
                  <input id={`${id}-name`} name="name" autoComplete="given-name" placeholder={t.name} aria-invalid={errors.name ? true : undefined} aria-describedby={describe("name")} className={field} />
                  {errorText("name")}
                </div>
                <div>
                  <label htmlFor={`${id}-surname`} className="sr-only">
                    {t.surname}
                  </label>
                  <input id={`${id}-surname`} name="surname" autoComplete="family-name" placeholder={t.surname} aria-invalid={errors.surname ? true : undefined} aria-describedby={describe("surname")} className={field} />
                  {errorText("surname")}
                </div>
              </div>
            ) : null}
            <div>
              <label htmlFor={`${id}-email`} className="sr-only">
                {t.email}
              </label>
              <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder={t.email} aria-invalid={errors.email ? true : undefined} aria-describedby={describe("email")} className={field} />
              {errorText("email")}
            </div>
            {signup ? (
              <div>
                <label htmlFor={`${id}-phone`} className="sr-only">
                  {t.phone}
                </label>
                <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" placeholder={t.phone} aria-invalid={errors.phone ? true : undefined} aria-describedby={describe("phone")} className={field} />
                {errorText("phone")}
              </div>
            ) : null}
            <div>
              <label htmlFor={`${id}-password`} className="sr-only">
                {t.password}
              </label>
              <input
                id={`${id}-password`}
                name="password"
                type="password"
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder={signup ? `${t.password} · ${t.passwordHint}` : t.password}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={describe("password")}
                className={field}
              />
              {errorText("password")}
              {signup ? null : (
                <button type="button" onClick={() => choose("forgot")} className="text-soft hover:text-ink mt-1 inline-flex min-h-9 items-center text-sm underline underline-offset-4">
                  {forgot.link}
                </button>
              )}
            </div>

            {signup ? (
              <div className="space-y-2 pt-1 text-sm">
                <label className="flex cursor-pointer items-start gap-3">
                  <input name="terms" type="checkbox" aria-invalid={errors.terms ? true : undefined} aria-describedby={describe("terms")} className="accent-ink mt-0.5 size-5 shrink-0" />
                  <span>
                    {t.consentTerms}{" "}
                    <a href={`/${lang}/info/legal`} target="_blank" className="underline underline-offset-4">
                      {t.consentLink}
                    </a>
                  </span>
                </label>
                {errorText("terms")}
                <label className="flex cursor-pointer items-start gap-3">
                  <input name="marketing" type="checkbox" className="accent-ink mt-0.5 size-5 shrink-0" />
                  <span className="text-soft">{t.consentMarketing}</span>
                </label>
              </div>
            ) : null}

            {errors.form ? (
              <p role="alert" className="text-sm text-red-800">
                {errors.form}{" "}
                {mode === "signin" ? (
                  <button type="button" onClick={() => choose("signup")} className="text-ink underline underline-offset-4">
                    {t.switchToSignUp}
                  </button>
                ) : null}
              </p>
            ) : null}

            <button type="submit" disabled={sending} className="btn-mocha w-full disabled:opacity-60">
              {sending ? t.sending : signup ? t.signUpCta : t.signInCta}
            </button>
            {signup ? <p className="text-soft text-xs">{t.note}</p> : null}
          </form>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
