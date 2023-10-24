import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import React from 'react';
import Seo from 'src/components/seo/seo';

import staticAPIData from './assets/api-docs.json';
import staticPreviewAPIData from './assets/api-preview-docs.json';
import Articles from './components/articles/articles';
import PageNav from './components/page-nav';
import getArticles from './utils/get-articles';

const staticArticles = getArticles(staticAPIData);
const staticPreviewArticles = getArticles(staticPreviewAPIData);

const ApiReference = () => {
  const { t } = useTranslation('pages.api-reference');

  return (
    <Box>
      <Seo title={t('html-title')} slug="/api-reference" />
      <Layout>
        <PageNav
          articles={staticArticles}
          previewArticles={staticPreviewArticles}
        />
        <Articles
          articles={staticArticles}
          previewArticles={staticPreviewArticles}
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
