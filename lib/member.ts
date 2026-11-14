"use client";

import { useSyncExternalStore } from "react";

/**
 * The visitor's Collavé Club membership and wish list.
 *
 * TODO: real accounts. Everything here lives in this browser only (localStorage);
 * swap these functions for the shop back end when it exists.
 */

export type Member = { name: string; surname?: string; email: string; phone?: string; since?: string; marketing?: boolean };
export type Saved = { id: string; name: string; subtitle: string; price: string | null; image: string };
export type View = "profile" | "membership" | "wishlist" | "purchases";

const MEMBER = "collave-member";
const WISHLIST = "collave-wishlist";
const EVENT = "collave:member";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  cache.delete(key);
  window.dispatchEvent(new Event(EVENT));
};

// useSyncExternalStore needs a stable snapshot, so parse once per change.
const cache = new Map<string, unknown>();
const snapshot = <T,>(key: string, fallback: T) => () => {
  if (!cache.has(key)) cache.set(key, read(key, fallback));
  return cache.get(key) as T;
};

const subscribe = (fn: () => void) => {
  const onStorage = () => {
    cache.clear();
    fn();
  };
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
};

const EMPTY: Saved[] = [];
const memberSnap = snapshot<Member | null>(MEMBER, null);
const wishSnap = snapshot<Saved[]>(WISHLIST, EMPTY);

export const useMember = () => useSyncExternalStore(subscribe, memberSnap, () => null);
export const useWishlist = () => useSyncExternalStore(subscribe, wishSnap, () => EMPTY);

// Accounts created on this device (no passwords are ever stored), so a member can sign back in.
const ACCOUNTS = "collave-accounts";
export const findAccount = (email: string) =>
  read<Member[]>(ACCOUNTS, []).find((a) => a.email.toLowerCase() === email.trim().toLowerCase()) ?? null;

export const signIn = (m: Member) => {
  const others = read<Member[]>(ACCOUNTS, []).filter((a) => a.email.toLowerCase() !== m.email.toLowerCase());
  try {
    localStorage.setItem(ACCOUNTS, JSON.stringify([...others, m]));
  } catch {}
  write(MEMBER, m);
};
export const signOut = () => write(MEMBER, null);

export const toggleSaved = (item: Saved) => {
  const list = read<Saved[]>(WISHLIST, []);
  write(WISHLIST, list.some((s) => s.id === item.id) ? list.filter((s) => s.id !== item.id) : [...list, item]);
};

/** Open the header account panel on a given step (create account, sign in or forgot password). */
export const openAccountPanel = (mode: "signup" | "signin" | "forgot") => window.dispatchEvent(new CustomEvent("collave:account", { detail: mode }));

/** Ask the header to open Create account (used when a visitor taps a heart first). */
export const askToJoin = () => openAccountPanel("signup");

/** Change the signed-in member's details on this device. */
export const updateMember = (patch: Partial<Member>) => {
  const current = read<Member | null>(MEMBER, null);
  if (current) signIn({ ...current, ...patch });
};

/** Open one of the account pages; null returns to the site. */
export const openView = (view: View | null) => window.dispatchEvent(new CustomEvent("collave:view", { detail: view }));
