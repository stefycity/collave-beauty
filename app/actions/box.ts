"use server";

import { EMAIL } from "@/lib/validate";

export type BoxResult = { ok: true } | { ok: false };

/**
 * Receives a beauty box request from a signed-in member.
 *
 * TODO: send it to the shop or to Collavé. Right now it is validated and written to the server log only.
 */
export async function requestBox(input: { name: string; email: string; products: string[]; lang: string }): Promise<BoxResult> {
  if (!input.name?.trim() || !EMAIL.test(input.email ?? "") || !input.products?.length || input.products.length > 6) return { ok: false };
  console.info("[collave] beauty box", { ...input, receivedAt: new Date().toISOString() });
  return { ok: true };
}
