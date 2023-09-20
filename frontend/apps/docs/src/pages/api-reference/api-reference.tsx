import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Articles from './components/articles/articles';
import PageNav from './components/page-nav';
import staticAPIData from './server/api-docs.json';
import staticPreviewAPIData from './server/api-preview-docs.json';
import getArticles from './utils/get-articles';
import getNavigation from './utils/get-navigation/get-navigation';

const staticNavigation = getNavigation(staticAPIData);
const staticPreviewNavigation = getNavigation(staticPreviewAPIData);
const staticArticles = getArticles(staticAPIData);
const staticPreviewArticles = getArticles(staticPreviewAPIData);

const ApiReference = () => {
  const { t } = useTranslation('pages.api-reference');

  return (
    <Box>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <Layout>
        <PageNav
          navigation={staticNavigation}
          navigationPreviewSection={staticPreviewNavigation}
        />
        <Articles
          articles={staticArticles}
          staticPreviewArticles={staticPreviewArticles}
        />
      </Layout>
    </Box>
  );
};

const Layout = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};

    width: 100vw;
    height: 100vh;

    ${media.greaterThan('md')`
      overflow: hidden;
      display: grid;
      grid-template-columns: var(--page-aside-nav-api-reference-width) 1fr;
      grid-template-areas: 'nav content';
    `}
  `}
`;

export default ApiReference;
