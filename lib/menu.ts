import en from "@/data/menu.en.json";
import bg from "@/data/menu.bg.json";
import breakfastEn from "@/data/breakfast.en.json";
import breakfastBg from "@/data/breakfast.bg.json";

import type { Locale } from "@/lib/copy";
import { drinkTint, type DrinkTint } from "@/lib/drink-tints";

export interface Item {
  id: string;
  name: string;
  subtitle: string;
  size: string;
  price: string | null;
  /** The price as a number, for totals. */
  amount?: number | null;
  image: string;
  details: { label: string; items: string[] }[];
  /** Drinks only: card colours, taken from what is in the glass. */
  tint?: DrinkTint;
  /** Tall glasses and bottles fit whole instead of filling the panel. */
  tall?: boolean;
  /** Bottled drinks take no add-ons, so their strip only gives the size. */
  noCollagen?: boolean;
}

export interface Group {
  id: string;
  name: string;
  items: Item[];
}

type Raw = typeof en.beauty;

const shape = (groups: Raw, lang: Locale, image: (id: string, raw: string | null) => string): Group[] => {
  const euro = new Intl.NumberFormat(lang === "bg" ? "bg-BG" : "en-IE", { style: "currency", currency: "EUR" });
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    items: g.items.map((i) => ({
      id: `${g.id}-${i.id}`,
      name: i.name,
      subtitle: i.subtitle,
      size: i.size,
      price: typeof i.price === "number" ? euro.format(i.price) : null,
      amount: typeof i.price === "number" ? i.price : null,
      image: image(i.id, i.image as string | null),
      details: i.details,
    })),
  }));
};

export function getMenu(lang: Locale) {
  const data = lang === "bg" ? bg : en;
  const beautyImage = (id: string, raw: string | null) => (raw ?? `/boutique/${id}.webp`).replace("/boutique/", "/products/");
  const all = shape(data.beauty, lang, beautyImage);
  return {
    // The collagen powders get their own section below the beauty collection.
    beauty: all.filter((g) => g.id !== "drinks"),
    collagen: all.filter((g) => g.id === "drinks"),
    drinks: shape(data.drinks as Raw, lang, (id) => `/drinks/${id}.webp`).map((g, gi) => ({
      ...g,
      items: g.items.map((item, ii) => ({
        ...item,
        tint: drinkTint(data.drinks[gi].items[ii].id),
        tall: g.id === "smoothie" || g.id === "waters",
        noCollagen: g.id === "waters",
      })),
    })),
  };
}

/** Collagen bowls and brownies, as on the original Collavé site. */
export function getBreakfast(lang: Locale): Group[] {
  const euro = new Intl.NumberFormat(lang === "bg" ? "bg-BG" : "en-IE", { style: "currency", currency: "EUR" });
  return (lang === "bg" ? breakfastBg : breakfastEn).map((g) => ({
    id: g.id,
    name: g.name,
    items: g.items.map((i) => ({
      id: `${g.id}-${i.id}`,
      name: i.name,
      subtitle: i.subtitle,
      size: i.size,
      price: typeof i.price === "number" ? euro.format(i.price) : null,
      amount: typeof i.price === "number" ? i.price : null,
      image: i.image,
      details: i.details,
    })),
  }));
}
