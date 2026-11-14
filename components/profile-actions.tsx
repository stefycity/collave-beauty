"use client";

import { useId, useState, type FormEvent } from "react";

import { requestAccountDeletion, setNewsletter, updateAccount } from "@/app/actions/help";
import type { Copy } from "@/lib/copy";
import { updateMember, type Member } from "@/lib/member";
import { EMAIL, isPhone } from "@/lib/validate";

type Errors = Partial<Record<"name" | "surname" | "email" | "phone", string>>;

/** My profile: change details, newsletter on/off, request account deletion. */
export function ProfileActions({ member, t, p }: { member: Member; t: Copy["club"]; p: Copy["help"]["profile"] }) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteSent, setDeleteSent] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = event.currentTarget;
    const v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value.trim();
    const next: Errors = {};
    if (!v("name")) next.name = t.nameError;
    if (!v("surname")) next.surname = t.surnameError;
    if (!EMAIL.test(v("email"))) next.email = t.error;
    if (!isPhone(v("phone"))) next.phone = t.phoneError;
    setErrors(next);
    const first = (["name", "surname", "email", "phone"] as const).find((k) => next[k]);
    if (first) return (f.elements.namedItem(first) as HTMLInputElement).focus();
    const details = { name: v("name"), surname: v("surname"), email: v("email"), phone: v("phone") };
    const r = await updateAccount({ ...details, previousEmail: member.email }).catch(() => ({ ok: false as const }));
    if (!r.ok) return setErrors({ name: t.failed });
    updateMember(details);
    setEditing(false);
    setSaved(true);
  };

  const toggleNewsletter = async () => {
    const next = !member.marketing;
    await setNewsletter(member.email, next).catch(() => null);
    updateMember({ marketing: next });
  };

  const remove = async () => {
    const r = await requestAccountDeletion({ name: [member.name, member.surname].filter(Boolean).join(" "), email: member.email }).catch(() => ({ ok: false as const }));
    if (r.ok) setDeleteSent(true);
  };

  const field = "border-ink/40 focus:border-ink mt-1 min-h-11 w-full border bg-white px-3 text-base outline-none";
  const input = (name: keyof Errors, label: string, type = "text", auto = "on") => (
    <label className="text-sm" htmlFor={`${id}-${name}`}>
      {label}
      <input
        id={`${id}-${name}`}
        name={name}
        type={type}
        autoComplete={auto}
        defaultValue={member[name] ?? ""}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
        className={field}
      />
      {errors[name] ? (
        <span id={`${id}-${name}-error`} className="mt-1 block text-red-800">
          {errors[name]}
        </span>
      ) : null}
    </label>
  );

  return (
    <div className="max-w-md">
      {/* Change details */}
      {editing ? (
        <form noValidate onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
          {input("name", t.name, "text", "given-name")}
          {input("surname", t.surname, "text", "family-name")}
          {input("email", t.email, "email", "email")}
          {input("phone", t.phone, "tel", "tel")}
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-mocha w-auto px-6">
              {p.save}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-line w-auto px-6">
              {p.cancel}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setSaved(false);
              setEditing(true);
            }}
            className="btn-mocha w-auto px-6"
          >
            {p.edit}
          </button>
          {saved ? (
            <p role="status" className="text-soft text-sm">
              {p.saved}
            </p>
          ) : null}
        </div>
      )}

      {/* Newsletter */}
      <div className="border-line mt-10 flex items-center justify-between gap-4 border-t pt-6">
        <div>
          <h3 className="text-sm tracking-wide uppercase">{p.newsletter}</h3>
          <p className="text-soft mt-1 text-sm" aria-live="polite">
            {member.marketing ? p.newsletterOn : p.newsletterOff}
          </p>
        </div>
        <button type="button" onClick={toggleNewsletter} className="btn-line w-auto shrink-0 px-5">
          {member.marketing ? p.unsubscribe : p.subscribe}
        </button>
      </div>

      {/* Delete account */}
      <div className="border-line mt-6 border-t pt-6">
        <h3 className="text-sm tracking-wide uppercase">{p.deleteTitle}</h3>
        {deleteSent ? (
          <p role="status" className="mt-2 text-sm">
            {p.deleteSent}
          </p>
        ) : (
          <>
            <p className="text-soft mt-1 text-sm">{p.deleteBody}</p>
            {confirmDelete ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={remove} className="btn w-auto border border-red-800 px-6 text-red-800 hover:bg-red-800 hover:text-white">
                  {p.deleteConfirm}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="btn-line w-auto px-6">
                  {p.cancel}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-soft hover:text-ink mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
                {p.deleteCta}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
