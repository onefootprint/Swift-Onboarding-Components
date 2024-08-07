import styled, { css } from 'styled-components';

import { Box, media } from '@onefootprint/ui';
import Markdown from 'src/components/markdown';
import { ARTICLES_CONTAINER_ID } from 'src/pages/api-reference/components/articles/articles';
import Article from 'src/pages/api-reference/components/articles/components/article';
import SideBySideElement from 'src/pages/api-reference/components/articles/components/side-by-side-element';
import { HydratedArticle } from 'src/pages/api-reference/hooks';
import EndpointsOverview from './endpoints-overview';

export type SubSection = {
  title: string;
  content: string;
  apiArticles: HydratedArticle[];
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
  return (
    <ArticleList id={ARTICLES_CONTAINER_ID}>
      {subsections.map(subsection => {
        return (
          <>
            <SideBySideElement
              id={subsection.title}
              left={
                <Box marginTop={8}>
                  <Markdown>{subsection.content}</Markdown>
                </Box>
              }
              right={<EndpointsOverview apiArticles={subsection.apiArticles} />}
            />
            {subsection.apiArticles.map(api => (
              <Article key={api.id} article={api} />
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
