import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';
import Cmd from 'src/pages/docs/components/cmd/cmd';
import type { Article } from 'src/types/article';
import type { PageNavigation } from 'src/types/page';

import AppHeader from './components/app-header';
import DesktopNav from './components/nav/desktop-nav';
import Sections from './components/sections';

type DocsProps = {
  children: React.ReactNode;
  article: Article;
  navigation: PageNavigation;
};

const Docs = ({ children, navigation, article }: DocsProps) => (
  <>
    <AppHeader navigation={navigation} />
    <MainContainer>
      <DesktopNav navigation={navigation} />
      <Content gridArea="content">{children}</Content>
      <GridAssigner gridArea="sections">
        <Sections sections={article.data.sections} />
      </GridAssigner>
    </MainContainer>
    <Cmd navigation={navigation} />
  </>
);

const Content = styled.article<{ gridArea: 'nav' | 'content' | 'sections' }>`
  ${({ gridArea, theme }) => css`
    grid-area: ${gridArea};
    max-width: 100%;
    padding: ${theme.spacing[10]} ${theme.spacing[6]};

    ${media.greaterThan('md')`
      padding-top: calc(${theme.spacing[10]} + var(--header-height));
      max-width: var(--page-content-width);
      margin: 0 auto;
    `};
  `}
`;

const GridAssigner = styled.div<{ gridArea: 'nav' | 'content' | 'sections' }>`
  ${({ gridArea }) => css`
    grid-area: ${gridArea};
  `}
`;

const MainContainer = styled.main`
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

export default Docs;
