import { media } from '@onefootprint/ui';
import React from 'react';
import type { Article } from 'src/types/article';
import type { ProductArticle } from 'src/types/product';
import styled, { css } from 'styled-components';

import ArticleSections from './components/article-sections';
import ProductNavigation from './components/product-navigation';

export type ArticleLayoutProps = {
  children: React.ReactNode;
  product: {
    name: string;
    articles: ProductArticle[];
  };
  article: Article;
};

const ArticleLayout = ({ children, article, product }: ArticleLayoutProps) => (
  <Content>
    <ProductNavigation articles={product.articles} name={product.name} />
    <Main>
      <ArticleContent>{children}</ArticleContent>
      <ArticleSections sections={article.data.sections} />
    </Main>
  </Content>
);

const Content = styled.div`
  display: flex;
  margin-top: var(--header-height);
  width: 100%;

  ${media.greaterThan('sm')`
    padding-left: var(--product-aside-nav-width);
  `}
`;

const Main = styled.main`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[7]}px ${theme.spacing[5]}px;
    width: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]}px;
    `}

    ${media.greaterThan('lg')`
      display: grid;
      gap: ${theme.spacing[9]}px;
      grid-template-columns: auto 260px;
      padding: ${theme.spacing[9]}px;
    `}
  `};
`;

const ArticleContent = styled.article`
  max-width: 720px;
  width: 100%;

  ${media.greaterThan('lg')`
    margin: 0 auto;
  `}
`;

export default ArticleLayout;
