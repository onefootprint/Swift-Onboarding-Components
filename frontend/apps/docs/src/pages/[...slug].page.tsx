import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import {
  getAllArticles,
  getNavigation,
  getPageBySlug,
} from '../utils/articles';

export async function getStaticPaths() {
  const pages = await getAllArticles();
  const paths = pages.map(({ data }) => data.slug);
  return { paths, fallback: false };
}

type Params = ParsedUrlQuery & {
  slug: string[];
};

export const getStaticProps: GetStaticProps<any, Params> = async context => {
  const { slug } = context.params!;
  const page = await getPageBySlug('/'.concat(slug.join('/')));
  const navigation = await getNavigation();
  if (!page) {
    return { notFound: true };
  }
  const items = navigation.get(page.data.product) || new Set();
  return {
    props: {
      product: {
        name: page.data.product,
        articles: Array.from(items).sort((a, b) => a.position - b.position),
      },
      article: {
        data: page.data,
        content: page.content,
      },
    },
  };
};

export { default } from './article';
