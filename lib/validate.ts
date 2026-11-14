export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A phone number: digits with optional +, spaces, dashes or brackets, 8 to 15 digits in all. */
export const isPhone = (v: string) => /^\+?[\d\s\-()]+$/.test(v.trim()) && (v.match(/\d/g)?.length ?? 0) >= 8 && (v.match(/\d/g)?.length ?? 0) <= 15;
