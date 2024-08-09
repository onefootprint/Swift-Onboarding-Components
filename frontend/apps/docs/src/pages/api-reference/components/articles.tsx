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

export type SubSection = {
  title: string;
  id: string;
  content: string;
  apiArticles: ApiArticleContent[];
};

export type PageNavSection = {
  title: string;
  isPreview: boolean;
  subsections: SubSection[];
};

export type ArticlesProps = {
  sections: PageNavSection[];
};

const Articles = ({ sections }: ArticlesProps) => {
  const subsections = sections.flatMap(s => s.subsections);
  const MARKDOWN_OVERRIDES = {
    ScrollLink,
  };
  return (
    <ArticleList id={ARTICLES_CONTAINER_ID}>
      {subsections.map(subsection => {
        return (
          <>
            <SideBySideElement
              id={subsection.id}
              left={
                <Box marginTop={8}>
                  <Markdown overrides={MARKDOWN_OVERRIDES}>{subsection.content}</Markdown>
                </Box>
              }
              right={<EndpointsOverview apiArticles={subsection.apiArticles} />}
            />
            {subsection.apiArticles.map(article => (
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
