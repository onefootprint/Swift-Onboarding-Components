import React from 'react';
import type { Article } from 'src/types/page';
import styled, { css } from 'styled-components';

import ArticleSections from './components/article-sections';
import PageHeader from './components/page-header';
import ProductNavigation from './components/product-navigation';

export type LayoutProps = {
  children: React.ReactNode;
  product: {
    name: string;
    articles: { title: string; slug: string }[];
  };
  article: Article;
};

const Layout = ({ children, article, product }: LayoutProps) => (
  <>
    <PageHeader />
    <Content>
      <ProductNavigation items={product.articles} name={product.name} />
      <Main>
        <ArticleContent>{children}</ArticleContent>
        <ArticleSections sections={article.data.sections} />
      </Main>
    </Content>
  </>
);

const Content = styled.div`
  display: flex;
  margin-top: var(--header-height);
  width: 100%;
`;

const Main = styled.main`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[9]}px;
    grid-template-columns: auto 260px;
    padding: ${theme.spacing[9]}px;
    width: 100%;
  `};
`;

const ArticleContent = styled.article`
  max-width: 720px;
  margin: 0px auto;
  width: 100%;
`;

export default Layout;
