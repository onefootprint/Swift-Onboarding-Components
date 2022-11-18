type Item = {
  name: string;
  href: string;
};

type Option = {
  name: string;
  links: Item[];
};

const vanilla: Option = {
  name: 'Vanilla JS',
  links: [
    {
      name: 'Pure Vanila JS',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vanilla-js',
    },
    {
      name: 'Vite + Vanilla JS',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vite-vanilla',
    },
    {
      name: 'Go + Vanilla JS',
      href: 'https://github.com/onefootprint/examples/tree/master/go-vanilla-js',
    },
  ],
};

const react: Option = {
  name: 'React',
  links: [
    {
      name: 'With CRA',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-cra',
    },
    {
      name: 'With Next',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-next',
    },
    {
      name: 'With Next + Typescript',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-typescript-next',
    },
    {
      name: 'React with customization',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-customized',
    },
  ],
};

const vue: Option = {
  name: 'Vue',
  links: [
    {
      name: 'Vite + Vue',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vite-vue',
    },
  ],
};

const mobile: Option = {
  name: 'Mobile',
  links: [
    {
      name: 'React Native',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-native',
    },
  ],
};

const go: Option = {
  name: 'Go',
  links: [
    {
      name: 'Go + Vanilla',
      href: 'https://github.com/onefootprint/examples/tree/master/go-vanilla-js',
    },
  ],
};

const customized: Option = {
  name: 'Customized flows',
  links: [
    {
      name: 'Vanilla + customization',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vanilla-js',
    },
    {
      name: 'React with customization',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-customized',
    },
  ],
};

const allOptions = [vanilla, react, vue, mobile, go, customized];

const getAllLinksAndRemovedDuplicated = () => {
  const links = allOptions.map(option => option.links).flat();
  return [...new Map(links.map(item => [item.name, item])).values()];
};

export const options = [
  { name: 'All', links: getAllLinksAndRemovedDuplicated() },
  ...allOptions,
];

export const [defaultOption] = options;
