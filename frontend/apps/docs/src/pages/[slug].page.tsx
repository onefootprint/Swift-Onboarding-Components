import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import { getAllPages, getNavigation, getPageBySlug } from '../utils/get-docs';

export async function getStaticPaths() {
  const pages = await getAllPages();
  const paths = pages.map(({ data }) => data.slug);
  return { paths, fallback: false };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<any, Params> = async context => {
  const { slug } = context.params!;
  const page = await getPageBySlug(`/${slug}`);
  const navigation = await getNavigation();
  if (!page) {
    return { notFound: true };
  }
  const items = navigation.get(page.data.section) || new Set();

  return {
    props: {
      navigation: {
        section: page.data.section,
        primary: {},
        secondary: Array.from(items).sort((a, b) => a.position - b.position),
      },
      page: {
        data: page.data,
        content: page.content,
      },
    },
  };
};

export { default } from './doc-page';
