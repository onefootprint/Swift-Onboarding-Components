export type NavBarEntry = NavBarLink | NavBarMenu;
export type NavBarLink = {
  text: string;
  href: string;
};

export type NavBarMenuItem = {
  text: string;
  href: string;
  icon: React.ReactNode;
  subtext: string;
};
export type NavBarMenu = { text: string; items: NavBarMenuItem[] };

export function isNavBarLink(entry: NavBarEntry): entry is NavBarLink {
  return (entry as NavBarLink).href !== undefined;
}

export function isNavBarMenu(entry: NavBarEntry): entry is NavBarMenu {
  return (entry as NavBarMenu).items !== undefined;
}
