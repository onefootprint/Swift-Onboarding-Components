import React from 'react';
import styled, { css } from 'styled-components';

import type { PageNavSection } from '../page-nav/page-nav';
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
  `}
`;

export default Articles;
