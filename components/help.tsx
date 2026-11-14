"use client";

import { Check, Plus } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { requestReturn } from "@/app/actions/help";
import type { Copy } from "@/lib/copy";
import { openAccountPanel, openView, useMember } from "@/lib/member";
import { EMAIL } from "@/lib/validate";

type Help = Copy["help"];
type Action = keyof Help["actions"];

/** Questions and answers, each with the action it describes (create account, start a return…). */
export function HelpSections({ t, ids }: { t: Help; ids: string[] }) {
  const member = useMember();

  const run = (a: Action) => {
    if (a === "return") return document.getElementById("return")?.scrollIntoView({ behavior: "smooth" });
    if (a === "signup") return member ? openView("profile") : openAccountPanel("signup");
    if (a === "forgot") return openAccountPanel("forgot");
    return member ? openView("profile") : openAccountPanel("signin");
  };

  return (
    <div className="space-y-14">
      {t.sections
        .filter((s) => ids.includes(s.id))
        .map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-20">
            <h2 id={`${s.id}-title`} className="text-soft text-xs tracking-[0.3em] uppercase">
              {s.title}
            </h2>
            <div className="border-line mt-4 border-t">
              {s.items.map((item, i) => (
                <details key={item.q} open={i === 0} className="group border-line border-b">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.0625rem] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Plus className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-45" strokeWidth={1.25} aria-hidden />
                  </summary>
                  <div className="text-soft max-w-2xl space-y-3 pb-6 leading-relaxed">
                    {item.a.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {"action" in item && item.action ? (
                      <button type="button" onClick={() => run(item.action as Action)} className="btn-mocha mt-2 w-auto px-6">
                        {t.actions[item.action as Action]}
                      </button>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

type Errors = Partial<Record<"name" | "email" | "order" | "products" | "confirm" | "server", string>>;

/** Written notice of withdrawal: return or cancel an order within 14 days. */
export function ReturnForm({ t, lang }: { t: Help["returnForm"]; lang: string }) {
  const member = useMember();
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const next: Errors = {};
    if (!v("name")) next.name = t.errors.name;
    if (!EMAIL.test(v("email"))) next.email = t.errors.email;
    if (!v("order")) next.order = t.errors.order;
    if (!v("products")) next.products = t.errors.products;
    if (!(form.elements.namedItem("confirm") as HTMLInputElement).checked) next.confirm = t.errors.confirm;
    setErrors(next);
    const first = (["name", "email", "order", "products", "confirm"] as const).find((k) => next[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement).focus();
      return;
    }
    setSending(true);
    const r = await requestReturn({ name: v("name"), email: v("email"), order: v("order"), received: v("received"), products: v("products"), reason: v("reason"), lang }).catch(() => ({ ok: false as const }));
    setSending(false);
    if (r.ok) setSent(true);
    else setErrors({ server: t.errors.server });
  };

  const field = "border-ink/40 focus:border-ink mt-1 min-h-11 w-full border bg-white px-3 text-base outline-none";
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${id}-${k}-error`} className="mt-1 text-sm text-red-800">
        {errors[k]}
      </p>
    ) : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${id}-${k}-error` : undefined });
  const fullName = member ? [member.name, member.surname].filter(Boolean).join(" ") : "";

  return (
    <section id="return" aria-labelledby="return-title" className="bg-mocha/10 scroll-mt-20 p-6 md:p-10">
      <h2 id="return-title" className="text-xl font-light tracking-wide uppercase">
        {t.title}
      </h2>
      {sent ? (
        <div role="status" className="mt-4 flex gap-4">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[#b07778]/25">
            <Check className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-lg font-light">{t.sentTitle}</p>
            <p className="text-soft mt-1">{t.sentBody}</p>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="mt-2">
          <p className="text-soft max-w-2xl">{t.lead}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm" htmlFor={`${id}-name`}>
              {t.name} *
              <input id={`${id}-name`} name="name" autoComplete="name" defaultValue={fullName} className={field} {...aria("name")} />
              {err("name")}
            </label>
            <label className="text-sm" htmlFor={`${id}-email`}>
              {t.email} *
              <input id={`${id}-email`} name="email" type="email" autoComplete="email" defaultValue={member?.email} className={field} {...aria("email")} />
              {err("email")}
            </label>
            <label className="text-sm" htmlFor={`${id}-order`}>
              {t.order} *
              <input id={`${id}-order`} name="order" className={field} {...aria("order")} />
              {err("order")}
            </label>
            <label className="text-sm" htmlFor={`${id}-received`}>
              {t.received}
              <input id={`${id}-received`} name="received" type="date" className={field} />
            </label>
            <label className="text-sm sm:col-span-2" htmlFor={`${id}-products`}>
              {t.products} *
              <textarea id={`${id}-products`} name="products" rows={2} className={`${field} py-2`} {...aria("products")} />
              {err("products")}
            </label>
            <label className="text-sm sm:col-span-2" htmlFor={`${id}-reason`}>
              {t.reason}
              <textarea id={`${id}-reason`} name="reason" rows={2} className={`${field} py-2`} />
            </label>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm">
            <input name="confirm" type="checkbox" className="accent-ink mt-0.5 size-5 shrink-0" {...aria("confirm")} />
            <span>{t.confirm}</span>
          </label>
          {err("confirm")}
          {errors.server ? (
            <p role="alert" className="mt-3 text-sm text-red-800">
              {errors.server}
            </p>
          ) : null}
          <button type="submit" disabled={sending} className="btn-mocha mt-6 w-auto px-8 disabled:opacity-60">
            {sending ? t.sending : t.submit}
          </button>
        </form>
      )}
    </section>
  );
}
