import { GetStaticProps } from 'next';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { getAllMarkdownFiles } from 'src/utils/articles';
import { NewApiReferenceProps } from './new-api-reference';

export type ApiArticleProps = {
  method: string;
  path: string;
};

export type ApiReferenceArticle = {
  content: string;
  data: {
    title: string;
    apis: ApiArticleProps[];
  };
};

export const getStaticProps: GetStaticProps<NewApiReferenceProps, Params> = async () => {
  const rawSections = await getAllMarkdownFiles<ApiReferenceArticle>('src/content/api-reference/**/**.mdx');
  const articles = rawSections.map(a => ({
    content: a.content,
    data: a.data,
  }));
  return {
    props: { articles },
  };
};

// This is rendered at build time. Since the content on this page is user-specific, we don't want to compile
// anything here.
// We only use this paradigm to fetch the markdown from the server
export default () => null;

export { type NewApiReferenceProps, NewApiReference } from './new-api-reference';
