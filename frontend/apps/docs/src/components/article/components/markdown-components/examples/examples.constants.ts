type Item = {
  name: string;
  href: string;
  img: {
    src: string;
    width: number;
    height: number;
  };
};

type Option = {
  name: string;
  links: Item[];
};

const vanilla: Option = {
  name: 'JS',
  links: [
    {
      name: 'JS',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vanilla-js',
      img: {
        src: '/examples/js.png',
        height: 32,
        width: 32,
      },
    },
    {
      name: 'Vite + JS',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vite-vanilla',
      img: {
        src: '/examples/js-vite.png',
        height: 32,
        width: 76,
      },
    },
    {
      name: 'Go + JS',
      href: 'https://github.com/onefootprint/examples/tree/master/go-vanilla-js',
      img: {
        src: '/examples/js-go.png',
        height: 32,
        width: 76,
      },
    },
  ],
};

const react: Option = {
  name: 'React',
  links: [
    {
      name: 'Create React App',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-cra',
      img: {
        src: '/examples/react.png',
        height: 32,
        width: 32,
      },
    },
    {
      name: 'Next',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-next',
      img: {
        src: '/examples/next.png',
        height: 32,
        width: 32,
      },
    },
    {
      name: 'Next + Typescript',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-typescript-next',
      img: {
        src: '/examples/next-ts.png',
        height: 32,
        width: 76,
      },
    },
    {
      name: 'React + custom UI',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-customized',
      img: {
        src: '/examples/react-customization.png',
        height: 32,
        width: 76,
      },
    },
  ],
};

const vue: Option = {
  name: 'Vue',
  links: [
    {
      name: 'Vite + Vue',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vite-vue',
      img: {
        src: '/examples/vite-vue.png',
        height: 32,
        width: 76,
      },
    },
  ],
};

const angular: Option = {
  name: 'AngularJS',
  links: [
    {
      name: 'AngularJS',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-angular',
      img: {
        src: '/examples/angular.png',
        height: 32,
        width: 32,
      },
    },
  ],
};

const mobile: Option = {
  name: 'Mobile',
  links: [
    {
      name: 'React Native',
      href: 'https://github.com/onefootprint/examples/tree/master/mobile-react-native',
      img: {
        src: '/examples/react.png',
        height: 32,
        width: 32,
      },
    },
    {
      name: 'Expo + React Native',
      href: 'https://github.com/onefootprint/examples/tree/master/mobile-expo',
      img: {
        src: '/examples/react.png',
        height: 32,
        width: 32,
      },
    },
  ],
};

const go: Option = {
  name: 'Go',
  links: [
    {
      name: 'Go + JS',
      href: 'https://github.com/onefootprint/examples/tree/master/go-vanilla-js',
      img: {
        src: '/examples/js-go.png',
        height: 32,
        width: 76,
      },
    },
  ],
};

const customized: Option = {
  name: 'Custom UI',
  links: [
    {
      name: 'JS + custom UI',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-vanilla-js',
      img: {
        src: '/examples/js-customization.png',
        height: 32,
        width: 76,
      },
    },
    {
      name: 'React + custom UI',
      href: 'https://github.com/onefootprint/examples/tree/master/frontend-react-customized',
      img: {
        src: '/examples/react-customization.png',
        height: 32,
        width: 76,
      },
    },
  ],
};

const allOptions = [vanilla, customized, mobile, react, vue, angular, go];

const getAllLinksAndRemovedDuplicated = () => {
  const links = allOptions.map(option => option.links).flat();
  return [...new Map(links.map(item => [item.name, item])).values()];
};

export const options = [
  { name: 'All', links: getAllLinksAndRemovedDuplicated() },
  ...allOptions,
];

export const [defaultOption] = options;
