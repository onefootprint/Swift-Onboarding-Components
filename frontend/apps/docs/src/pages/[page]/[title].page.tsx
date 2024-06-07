import type { ParsedUrlQuery } from 'querystring';
import type { GetStaticProps } from 'next';

import { getAllArticles, getArticleBySlug, getNavigationByPage } from '../../utils/articles';

export async function getStaticPaths() {
  const pages = await getAllArticles();
  const paths = pages.map(({ data }) => data.slug);
  return { paths, fallback: 'blocking' };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<Record<string, unknown>, Params> = async context => {
  const { page, title } = context.params!;
  if (!page || !title) {
    return { notFound: true };
  }

  const slug = `/${page}/${title}`;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return { notFound: true };
  }

  const navigation = await getNavigationByPage(article.data.page);
  if (!navigation) {
    return { notFound: true };
  }

  return {
    props: {
      page: {
        name: article.data.page,
        navigation,
      },
      article: {
        data: article.data,
        content: article.content,
      },
    },
  };
};

export { default } from 'src/components/article';
