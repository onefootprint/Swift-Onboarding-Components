import type { Icon } from '@onefootprint/icons';

export type NavItem = {
  baseHref: string;
  href: string;
  Icon: Icon;
  text: string;
};

export type LinkItem = {
  href: string;
  Icon: Icon;
  text: string;
};
