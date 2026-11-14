"use server";

export type BookingResult = { ok: true } | { ok: false };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Receives an in-store appointment.
 *
 * TODO: deliver it to booking@collave.bg (or a booking system) and check real availability.
 * Right now it is validated and written to the server log only.
 */
export async function bookAppointment(input: { name: string; surname?: string; email: string; phone?: string; date: string; time: string; lang: string; consent?: { terms: boolean; marketing: boolean } }): Promise<BookingResult> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  if (!name || !EMAIL.test(email ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return { ok: false };
  }
  console.info("[collave] appointment", { name, surname: input.surname, email, phone: input.phone, date: input.date, time: input.time, lang: input.lang, newAccountConsent: input.consent, receivedAt: new Date().toISOString() });
  return { ok: true };
}
