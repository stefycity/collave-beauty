"use server";

import { EMAIL, isPhone } from "@/lib/validate";

export type ClubResult = { ok: true } | { ok: false };

/**
 * Creates a Collavé account (Collavé Club, 10% off beauty orders). Sign-up consent is required;
 * marketing consent is optional and recorded with its time.
 *
 * TODO: store the member and send the code. Right now the email is validated
 * and written to the server log only. Connect a mailing list or the shop here.
 */
export async function joinClub(
  account: { name: string; surname: string; email: string; phone: string },
  lang: string,
  consent: { terms: boolean; marketing: boolean },
): Promise<ClubResult> {
  const name = account.name?.trim();
  const surname = account.surname?.trim();
  const email = account.email?.trim();
  const phone = account.phone?.trim();
  if (!name || !surname || !EMAIL.test(email ?? "") || !isPhone(phone ?? "") || !consent?.terms) return { ok: false };
  console.info("[collave] account", { name, surname, email, phone, lang, consent, receivedAt: new Date().toISOString() });
  return { ok: true };
}
