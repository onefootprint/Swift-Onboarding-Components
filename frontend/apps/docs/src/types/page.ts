export type Page = {
  navigation: PageNavigation;
};

export type PageNavigationItem = {
  position: number;
  slug: string;
  title: string;
};

export type PageNavigationCategory = {
  name: string;
  items: PageNavigationItem[];
};

export type APIRefPageNavigation = {
  name: string;
  items: PageNavigationItem[];
};

export type PageNavigation = PageNavigationCategory[];
