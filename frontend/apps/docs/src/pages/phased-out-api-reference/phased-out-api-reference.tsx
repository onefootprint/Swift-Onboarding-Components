import { Box, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import phasedOutApiData from '../api-reference/assets/phased-out-api-docs.json';
import Articles from '../api-reference/components/articles/articles';
import PageNav from '../api-reference/components/nav/desktop-page-nav';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import getArticles from '../api-reference/utils/get-articles';

const staticPhasedOutArticles = getArticles(phasedOutApiData);

const ApiReference = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.phased-out-reference',
  });
  // This is temporary, will remove this when authed dashboard is better supported
  const phasedOutArticles = useHydrateArticles(staticPhasedOutArticles).map(article => ({
    ...article,
    isHidden: false,
  }));
  const sections = [
    {
      title: t('title'),
      isPreview: true,
      articles: phasedOutArticles,
    },
  ];
  return (
    <Box>
      <Layout>
        <PageNav sections={sections} />
        <Articles sections={sections} />
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
