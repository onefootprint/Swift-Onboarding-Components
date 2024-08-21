import type { ListOptions, Option, Product } from './examples.types';

const getAllLinksAndRemovedDuplicated = (listOptions: ListOptions) => {
  const links = Object.entries(listOptions).flatMap(([, value]) => value.links);
  return [...new Map(links.map(item => [item.name, item])).values()];
};

const createOptions = (listOptions: ListOptions) => {
  const links = getAllLinksAndRemovedDuplicated(listOptions);
  const allOptions = Object.entries(listOptions).map(([, value]) => value);
  const options = [{ name: 'All', links }, allOptions].flat() as Option[];
  const [defaultOption] = options;
  return { options, defaultOption };
};

const onboardingComponents = createOptions({
  react: {
    name: 'React',
    links: [
      {
        name: 'KYC + Next.js',
        href: 'https://github.com/onefootprint/examples/tree/master/onboarding-components/kyc/web-next-js',
        img: {
          src: '/examples/next.png',
          height: 32,
          width: 32,
        },
      },
      {
        name: 'KYB + Next.js',
        href: 'https://github.com/onefootprint/examples/tree/master/onboarding-components/kyb/web-next-js',
        img: {
          src: '/examples/next.png',
          height: 32,
          width: 32,
        },
      },
    ],
  },
});

const products: Record<Product, { options: Option[]; defaultOption: Option }> = {
  'onboarding-components': onboardingComponents,
};

export default products;
