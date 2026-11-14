// Card colours for the drinks, picked from what is in the glass.
// `panel` sits behind the photo; `strip` is dark enough to carry white text.
export interface DrinkTint {
  panel: string;
  strip: string;
}

const TINTS: [RegExp, DrinkTint][] = [
  [/matcha/, { panel: "#c9d5ab", strip: "#66753f" }],
  [/white-water/, { panel: "#d3e2e8", strip: "#4f7482" }],
  [/thai-coco/, { panel: "#d2e6df", strip: "#467a69" }],
  [/mint/, { panel: "#d3e3c5", strip: "#5a7a48" }],
  [/blueberry/, { panel: "#d3cce6", strip: "#655a8f" }],
  [/strawberry-and-mango/, { panel: "#f7cfae", strip: "#a9622f" }],
  [/strawberry/, { panel: "#f4cccb", strip: "#a75656" }],
  [/peach/, { panel: "#f7d5ba", strip: "#a96a3f" }],
  [/mango/, { panel: "#f7dca3", strip: "#96701f" }],
  [/classic-lemonade/, { panel: "#f2e9ae", strip: "#7f7320" }],
  [/mocha|black-frappe/, { panel: "#d3bba5", strip: "#5f4432" }],
  [/espresso|americano/, { panel: "#dcc6af", strip: "#6d4f39" }],
  [/caramel|hazelnut/, { panel: "#ebd2ae", strip: "#8a6330" }],
  [/tea/, { panel: "#e3d3b5", strip: "#77623a" }],
];

const LATTE: DrinkTint = { panel: "#ecdfcc", strip: "#7f6a4f" };

export const drinkTint = (slug: string): DrinkTint =>
  TINTS.find(([match]) => match.test(slug))?.[1] ?? LATTE;
