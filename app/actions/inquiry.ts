"use server";

export interface InquiryInput {
  name: string;
  email: string;
  phone?: string;
  type: string;
  date?: string;
  guests: number;
  message?: string;
  lang: string;
}

export type InquiryResult = { ok: true } | { ok: false };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Receives a private room or event inquiry.
 *
 * TODO: deliver it to the café. Right now it is validated and written to the
 * server log only. Connect an email service or a CRM here.
 */
export async function sendInquiry(input: InquiryInput): Promise<InquiryResult> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  const guests = Number(input.guests);
  if (!name || !EMAIL.test(email ?? "") || !input.type || (input.type !== "gift-card" && !(guests >= 1 && guests <= 200))) {
    return { ok: false };
  }
  console.info("[collave] inquiry", {
    name,
    email,
    phone: input.phone?.trim() || undefined,
    type: input.type,
    date: input.date || undefined,
    guests: input.type === "gift-card" ? undefined : guests,
    message: input.message?.trim().slice(0, 2000) || undefined,
    lang: input.lang,
    receivedAt: new Date().toISOString(),
  });
  return { ok: true };
}
