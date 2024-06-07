import type { Icon } from '@onefootprint/icons';

export type NavEntry = NavLink | NavMenu;
export type NavLink = {
  text: string;
  href: string;
};

export type NavMenuItem = {
  text: string;
  href: string;
  iconComponent: Icon;
  subtext: string;
};
export type NavMenu = { text: string; items: NavMenuItem[] };

export const isNavLink = (entry: NavEntry): entry is NavLink => (entry as NavLink).href !== undefined;

export const isNavMenu = (entry: NavEntry): entry is NavMenu => (entry as NavMenu).items !== undefined;
