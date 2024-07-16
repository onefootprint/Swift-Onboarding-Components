import { Box, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo/seo';
import styled, { css } from 'styled-components';

import staticAPIData from './assets/api-docs.json';
import staticPreviewAPIData from './assets/api-preview-docs.json';
import phasedOutApiData from './assets/phased-out-api-docs.json';
import Articles from './components/articles/articles';
import Cmd from './components/cmd';
import PageNav from './components/page-nav';
import getArticles from './utils/get-articles';

const staticArticles = getArticles(staticAPIData);
const staticPreviewArticles = getArticles(staticPreviewAPIData);

const ApiReference = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });

  const sections = [
    {
      title: t('sections.footprint-api'),
      isPreview: false,
      articles: staticArticles,
    },
    {
      title: t('sections.footprint-api-preview'),
      isPreview: true,
      articles: staticPreviewArticles,
    },
  ];

  return (
    <Box>
      <Seo title={t('html-title')} slug="/api-reference" />
      <Layout>
        <PageNav sections={sections} />
        <Articles sections={sections} />
      </Layout>
      <Cmd sections={sections} />
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
      grid-template-columns: ${`var(--page-aside-nav-api-reference-width-small)`} 1fr;
      grid-template-areas: 'nav content';
      transition: grid-template-columns 0.3s ease-in-out;
      width: 100%;
    `}
  `}
`;

export default ApiReference;
