import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import React, { useRef } from 'react';
import Seo from 'src/components/seo/seo';
import { useHover } from 'usehooks-ts';

import staticAPIData from './assets/api-docs.json';
import staticPreviewAPIData from './assets/api-preview-docs.json';
import Articles from './components/articles/articles';
import PageNav from './components/page-nav';
import getArticles from './utils/get-articles';

const staticArticles = getArticles(staticAPIData);
const staticPreviewArticles = getArticles(staticPreviewAPIData);

const ApiReference = () => {
  const { t } = useTranslation('pages.api-reference');
  const navRef = useRef<HTMLElement>(null);
  const isNavHovered = useHover(navRef);

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
      <Layout isNavHovered={isNavHovered}>
        <PageNav sections={sections} ref={navRef} />
        <Articles sections={sections} />
      </Layout>
    </Box>
  );
};

const Layout = styled.div<{ isNavHovered: boolean }>`
  ${({ theme, isNavHovered }) => css`
    background: ${theme.backgroundColor.primary};
    width: 100vw;
    height: 100vh;

    ${media.greaterThan('md')`
      overflow: hidden;
      display: grid;
      grid-template-columns: calc(var(--page-aside-nav-api-reference-width) + ${
        isNavHovered ? '5%' : '0px'
      }) 1fr;
      grid-template-areas: 'nav content';
      transition: grid-template-columns 0.3s ease-in-out;
    `}
  `}
`;

export default ApiReference;
