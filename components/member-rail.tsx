import { Account } from "@/components/account";
import type { Copy, Locale } from "@/lib/copy";
import { getMenu } from "@/lib/menu";

/** The members' rail with its links, ready for any page. */
export function MemberRail({ t, lang }: { t: Copy; lang: Locale }) {
  const menu = getMenu(lang);
  return (
    <Account
      t={t.club}
      profile={t.help.profile}
      lang={lang}
      sections={[
        { href: `/${lang}#beauty`, label: t.nav.beauty, icon: "beauty" },
        { href: `/${lang}#collagen`, label: t.collagen.eyebrow, icon: "collagen" },
        { href: `/${lang}#coffee`, label: t.nav.coffee, icon: "coffee" },
        { href: `/${lang}#breakfast`, label: t.coffee.breakfast, icon: "breakfast" },
        { href: `/${lang}#rooms`, label: t.nav.rooms, icon: "events" },
      ]}
      products={[...menu.beauty, ...menu.collagen].flatMap((g) => g.items)}
    />
  );
}
