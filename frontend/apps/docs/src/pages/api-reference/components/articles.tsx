import styled, { css } from 'styled-components';

import { Box, media } from '@onefootprint/ui';
import Markdown from 'src/components/markdown';
import ApiArticle from 'src/pages/api-reference/components/api-article';
import ScrollLink from 'src/pages/api-reference/components/scroll-link';
import SideBySideElement from 'src/pages/api-reference/components/side-by-side-element';
import { HydratedArticle } from 'src/pages/api-reference/hooks';
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
  sections: ApiArticleSection[];
};

const Articles = ({ sections }: ArticlesProps) => {
  const MARKDOWN_OVERRIDES = {
    ScrollLink,
  };
  return (
    <ArticleList id={ARTICLES_CONTAINER_ID}>
      {sections.map(section => {
        return (
          <>
            <SideBySideElement
              id={section.id}
              left={
                <Box marginTop={8}>
                  <Markdown overrides={MARKDOWN_OVERRIDES}>{section.content}</Markdown>
                </Box>
              }
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
