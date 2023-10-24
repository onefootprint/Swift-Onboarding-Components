import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { Article as ApiReferenceArticle } from '../../api-reference.types';
import Article from './components/article';

export type ArticlesProps = {
  articles: ApiReferenceArticle[];
  previewArticles: ApiReferenceArticle[];
};

const Articles = ({ articles, previewArticles }: ArticlesProps) => (
  <ArticleList id="articles-container">
    {articles?.map(article => <Article article={article} />)}
    {previewArticles?.map(article => <Article article={article} />)}
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
