import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { ArticlesProps } from './articles.types';
import Article from './components/article';

const Articles = ({ staticArticles, staticPreviewArticles }: ArticlesProps) => (
  <ArticleList id="articles-container">
    {staticArticles?.map(article => (
      <Article
        id={article.id}
        parameters={article.parameters}
        description={article.description}
        method={article.method}
        path={article.path}
        security={article.security}
        responses={article.responses}
        requestBody={article.requestBody}
        key={article.id}
        tags={article.tags}
      />
    ))}
    {staticPreviewArticles?.map(article => (
      <Article
        id={article.id}
        parameters={article.parameters}
        description={article.description}
        method={article.method}
        path={article.path}
        security={article.security}
        responses={article.responses}
        requestBody={article.requestBody}
        key={article.id}
        tags={article.tags}
      />
    ))}
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
