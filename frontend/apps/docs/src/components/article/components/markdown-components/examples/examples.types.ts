export type Item = {
  name: string;
  href: string;
  img: {
    src: string;
    width: number;
    height: number;
  };
};

export type Option = {
  name: string;
  links: Item[];
};

export type ListOptions = Record<string, Option>;

export type Product = 'onboarding-components';
