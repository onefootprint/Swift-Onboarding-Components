import styled, { css } from 'styled-components';

import { media } from '@onefootprint/ui';
import type { PageNavSection } from '../nav/nav.types';
import Article from './components/article';

export type ArticlesProps = {
  sections: PageNavSection[];
};

export const ARTICLES_CONTAINER_ID = 'articles-container';

const Articles = ({ sections }: ArticlesProps) => {
  const articles = sections.flatMap(s => s.subsections).flatMap(s => s.apiArticles);
  return (
    <ArticleList id={ARTICLES_CONTAINER_ID}>
      {articles.map(article => (
        <Article key={article.id} article={article} />
      ))}
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
