import styled, { css } from 'styled-components';

import { media } from '@onefootprint/ui';
import ApiArticle from 'src/pages/api-reference/components/api-article';
import SideBySideElement from 'src/pages/api-reference/components/side-by-side-element';
import type { HydratedArticle } from 'src/pages/api-reference/hooks';
import type { IntroductionArticle } from '../index.page';
import ApiMarkdown from './api-markdown';
import EndpointsOverview from './endpoints-overview';

export const ARTICLES_CONTAINER_ID = 'articles-container';

export type ApiArticleContent = {
  title?: string;
  description?: string;
  api: HydratedArticle;
};

export type ApiArticleSection = {
  title: string;
  id: string;
  content: string;
  subsections: ApiArticleContent[];
};

export type ArticlesProps = {
  introductionSections: IntroductionArticle[];
  sections: ApiArticleSection[];
};

const Articles = ({ introductionSections, sections }: ArticlesProps) => {
  return (
    <ArticleList id={ARTICLES_CONTAINER_ID}>
      {introductionSections.map(section => (
        <SideBySideElement
          id={section.id}
          left={<ApiMarkdown>{section.leftContent || ''}</ApiMarkdown>}
          right={<ApiMarkdown>{section.rightContent || ''}</ApiMarkdown>}
        />
      ))}
      {sections.map(section => {
        return (
          <>
            <SideBySideElement
              id={section.id}
              left={<ApiMarkdown>{section.content}</ApiMarkdown>}
              right={<EndpointsOverview apiArticles={section.subsections} />}
            />
            {section.subsections.map(article => (
              <ApiArticle key={article.api.id} article={article} />
            ))}
          </>
        );
      })}
    </ArticleList>
  );
};

const ArticleList = styled.section`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    grid-area: content;
    min-height: 100%;
    display: flex;
    color: black;
    flex-direction: column;
    overflow-y: auto;
    margin-top: var(--header-height);

    ${media.greaterThan('md')`
      margin-top: 0;
    `}
  `}
`;

export default Articles;
