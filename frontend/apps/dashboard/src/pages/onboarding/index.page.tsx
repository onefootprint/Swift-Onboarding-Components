import type { GetStaticProps } from 'next';

export { default } from './onboarding';

export const getStaticProps: GetStaticProps = () => ({
  props: {
    layout: 'blank',
  },
});
