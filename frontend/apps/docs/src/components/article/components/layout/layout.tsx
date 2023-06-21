import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';
import type { Article } from 'src/types/article';
import type { Page } from 'src/types/page';

import PageNav from './components/page-nav';
import Sections from './components/sections';

export type LayoutProps = {
  children: React.ReactNode;
  page: Page;
  article: Article;
};

const Layout = ({ children, article, page }: LayoutProps) => (
  <LayoutContainer>
    <PageNav navigation={page.navigation} />
    <Main>
      <Content>{children}</Content>
      <Sections sections={article.data.sections} />
    </Main>
  </LayoutContainer>
);

const LayoutContainer = styled.div`
  display: flex;
  margin-top: var(--header-height);
  width: 100%;

  ${media.greaterThan('sm')`
    padding-left: var(--page-aside-nav-width);
  `}
`;

const Main = styled.main`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[7]} ${theme.spacing[5]};
    width: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
    `}

    ${media.greaterThan('lg')`
      display: grid;
      gap: ${theme.spacing[9]};
      grid-template-columns: auto 260px;
      padding: ${theme.spacing[9]};
    `}
  `};
`;

const Content = styled.article`
  max-width: 720px;
  width: 100%;

  ${media.greaterThan('lg')`
    margin: 0 auto;
  `}
`;

export default Layout;
