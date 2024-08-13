import { GetStaticProps } from 'next';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { getAllMarkdownFiles } from 'src/utils/articles';
import { getSectionId } from 'src/utils/section';
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

type RawIntroductionArticle = {
  content: string;
  data: {
    title: string;
  };
};

export type IntroductionArticle = {
  title: string;
  id: string;
  leftContent: string;
  rightContent: string;
};

export const getStaticProps: GetStaticProps<ApiReferenceProps, Params> = async () => {
  const rawIntroductionSections = await getAllMarkdownFiles<RawIntroductionArticle>(
    'src/content/api-reference/00-introduction/**.mdx',
  );

  const introductionSections: IntroductionArticle[] = rawIntroductionSections.map(article => {
    // We write each article as a single markdown file. We use this as a delimiter between the content that
    // is rendered in the left column vs the right column.
    const [leftContent, rightContent] = article.content.split('<ApiReferenceColumnBreak />');
    return {
      title: article.data.title,
      id: getSectionId(article.data.title),
      leftContent,
      rightContent: rightContent || '',
    };
  });

  const rawApiSections = await getAllMarkdownFiles<ApiReferenceArticle>('src/content/api-reference/**.mdx');
  const apiSections: ApiReferenceArticle[] = rawApiSections.map(a => ({
    content: a.content,
    data: a.data,
  }));
  return {
    props: { introductionSections, apiSections },
  };
};

export { default } from './api-reference';

export { type ApiReferenceProps, ApiReference } from './api-reference';
