"use server";

import { EMAIL } from "@/lib/validate";

type Result = { ok: true } | { ok: false };

/*
 * Customer service requests. TODO: deliver each to Collavé (email or the shop) once connected.
 * Right now they are validated and written to the server log only.
 */

const log = (kind: string, data: object) => console.info(`[collave] ${kind}`, { ...data, receivedAt: new Date().toISOString() });

export async function requestReturn(input: { name: string; email: string; order: string; received?: string; products: string; reason?: string; lang: string }): Promise<Result> {
  if (!input.name?.trim() || !EMAIL.test(input.email ?? "") || !input.order?.trim() || !input.products?.trim()) return { ok: false };
  log("return / withdrawal", input);
  return { ok: true };
}

export async function joinNewsletter(email: string, lang: string): Promise<Result> {
  if (!EMAIL.test(email?.trim() ?? "")) return { ok: false };
  log("newsletter sign-up", { email: email.trim(), lang });
  return { ok: true };
}

export async function setNewsletter(email: string, subscribed: boolean): Promise<Result> {
  if (!EMAIL.test(email ?? "")) return { ok: false };
  log(subscribed ? "newsletter resubscribe" : "newsletter unsubscribe", { email });
  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<Result> {
  if (!EMAIL.test(email?.trim() ?? "")) return { ok: false };
  log("password reset", { email: email.trim() });
  return { ok: true };
}

export async function requestAccountDeletion(input: { name: string; email: string }): Promise<Result> {
  if (!input.name?.trim() || !EMAIL.test(input.email ?? "")) return { ok: false };
  log("account deletion", input);
  return { ok: true };
}

export async function updateAccount(input: { name: string; surname: string; email: string; phone: string; previousEmail: string }): Promise<Result> {
  if (!input.name?.trim() || !input.surname?.trim() || !EMAIL.test(input.email ?? "")) return { ok: false };
  log("account details changed", input);
  return { ok: true };
}
