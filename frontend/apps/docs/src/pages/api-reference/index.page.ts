import { GetStaticProps } from 'next';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { getAllMarkdownFiles } from 'src/utils/articles';
import { ApiReferenceProps } from './api-reference';

export type ApiArticleProps = {
  method: string;
  path: string;
  title: string;
  description?: string;
};

export type ApiReferenceArticle = {
  content: string;
  data: {
    title: string;
    apis: ApiArticleProps[];
  };
};

export const getStaticProps: GetStaticProps<ApiReferenceProps, Params> = async () => {
  const rawSections = await getAllMarkdownFiles<ApiReferenceArticle>('src/content/api-reference/**/**.mdx');
  const articles = rawSections.map(a => ({
    content: a.content,
    data: a.data,
  }));
  return {
    props: { articles },
  };
};

export { default } from './api-reference';

export { type ApiReferenceProps, ApiReference } from './api-reference';
