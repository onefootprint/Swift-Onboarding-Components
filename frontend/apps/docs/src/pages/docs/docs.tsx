import { media } from '@onefootprint/ui';
import React from 'react';
import Cmd from 'src/pages/docs/components/cmd/cmd';
import type { Article } from 'src/types/article';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

import Page404 from '../404/404';
import AppHeader from './components/app-header';
import DesktopNav from './components/nav/desktop-nav';
import MobileNav from './components/nav/mobile-nav';
import Sections from './components/sections';

type DocsProps = {
  children: React.ReactNode;
  article: Article;
  navigation: PageNavigation;
};

const Docs = ({ children, navigation, article }: DocsProps) =>
  article ? (
    <>
      <AppHeader>
        <MobileNav navigation={navigation} />
      </AppHeader>
      <Main>
        <DesktopNav navigation={navigation} />
        <Content>{children}</Content>
        <GridAssigner>
          <Sections sections={article.data.sections} />
        </GridAssigner>
      </Main>
      <Cmd navigation={navigation} />
    </>
  ) : (
    <Page404 />
  );

const Content = styled.article`
  ${({ theme }) => css`
    grid-area: content;
    max-width: 100%;
    padding: ${theme.spacing[10]} ${theme.spacing[6]};

    ${media.greaterThan('md')`
      padding-top: calc(${theme.spacing[10]} + var(--header-height));
      max-width: var(--page-content-width);
      margin: 0 auto;
    `};
  `}
`;

const Main = styled.main`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    width: 100%;
    display: flex;

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: var(--page-aside-nav-width) 1fr;
      grid-template-areas: 'nav content';
    `}

    ${media.greaterThan('lg')`
      display: grid;
      grid-template-columns: var(--page-aside-nav-width) 1fr minmax(var(--page-sections-width), 320px);
      grid-template-areas: 'nav content sections';
    `}
  `}
`;

const GridAssigner = styled.div`
  grid-area: sections;
`;

export default Docs;
