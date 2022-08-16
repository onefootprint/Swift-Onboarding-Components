import React from 'react';
import styled, { css } from 'styled-components';
import { Container } from 'ui';

import AsideNavigation from './components/aside-navigation';
import PageHeader from './components/page-header';
import PageSections from './components/page-sections';

export type LayoutProps = {
  children: React.ReactNode;
  navigation: {
    section: string;
    secondary: { title: string; slug: string }[];
  };
};

const Layout = ({ children, navigation }: LayoutProps) => (
  <>
    <PageHeader />
    <Container fluid>
      <Content>
        <AsideNavigation
          items={navigation.secondary}
          section={navigation.section}
        />
        <Main>
          <Article>{children} </Article>
          <PageSections />
        </Main>
      </Content>
    </Container>
  </>
);

const Content = styled.div`
  display: flex;
  margin-top: 54px;
  width: 100%;
`;

const Main = styled.main`
  ${({ theme }) => css`
    width: 100%;
    display: grid;
    grid-template-columns: auto 250px;
    gap: ${theme.spacing[9]}px;
    padding: ${theme.spacing[9]}px ${theme.spacing[7]}px 0px
      ${270 + theme.spacing[9]}px;
  `};
`;

const Article = styled.article`
  max-width: 720px;
  width: 100%;
  overflow: hidden;
`;

export default Layout;
