import React from 'react';
import styled, { css } from 'styled-components';

import { media } from '@onefootprint/ui';
import type { PageNavSection } from '../nav/nav.types';
import Article from './components/article';

export type ArticlesProps = {
  sections: PageNavSection[];
};

const Articles = ({ sections }: ArticlesProps) => (
  <ArticleList id="articles-container">
    {sections.map(s => s.articles.map(article => <Article key={article.id} article={article} />))}
  </ArticleList>
);

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
