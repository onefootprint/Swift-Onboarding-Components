import { Box, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo/seo';
import styled, { css } from 'styled-components';

import staticAPIData from './assets/api-docs.json';
import staticPreviewAPIData from './assets/api-preview-docs.json';
import Articles from './components/articles/articles';
import Cmd from './components/cmd';
import DesktopPageNav from './components/nav/desktop-page-nav';
import MobilePageNav from './components/nav/mobile-page-nav';
import useHydrateArticles from './hooks/use-hydrate-articles';
import getArticles from './utils/get-articles';

const staticArticles = getArticles(staticAPIData);
const staticPreviewArticles = getArticles(staticPreviewAPIData);

const ApiReference = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const articles = useHydrateArticles(staticArticles);
  const previewArticles = useHydrateArticles(staticPreviewArticles);

  const sections = [
    {
      title: t('sections.footprint-api'),
      isPreview: false,
      articles,
    },
    {
      title: t('sections.footprint-api-preview'),
      isPreview: true,
      articles: previewArticles,
    },
  ];

  return (
    <Box>
      <Seo title={t('html-title')} slug="/api-reference" />
      <Layout>
        <MobilePageNav sections={sections} />
        <DesktopPageNav sections={sections} />
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
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas: 'content';

    ${media.greaterThan('md')`
      overflow: hidden;
      grid-template-columns: ${`var(--page-aside-nav-api-reference-width-small)`} minmax(0, 1fr);
      grid-template-areas: 'nav content';
      transition: grid-template-columns 0.3s ease-in-out;
      width: 100%;
    `}
  `}
`;

export default ApiReference;
