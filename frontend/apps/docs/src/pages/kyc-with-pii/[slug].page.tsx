import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import {
  DocsPage,
  getArticleBySlug,
  getArticlesForPage,
  getNavigation,
} from '../../utils/articles';

export async function getStaticPaths() {
  const pages = await getArticlesForPage(DocsPage.kycWithPii);
  const paths = pages.map(({ data }) => data.slug);
  return { paths, fallback: 'blocking' };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<any, Params> = async context => {
  const { slug } = context.params!;
  const article = await getArticleBySlug(DocsPage.kycWithPii, slug);
  const navigation = await getNavigation(DocsPage.kycWithPii);
  if (!article) {
    return { notFound: true };
  }
  const items = navigation.get(article.data.product) || new Set();
  return {
    props: {
      product: {
        name: article.data.product,
        articles: Array.from(items).sort((a, b) => a.position - b.position),
      },
      article: {
        data: article.data,
        content: article.content,
      },
    },
  };
};

export { default } from 'src/components/article';
