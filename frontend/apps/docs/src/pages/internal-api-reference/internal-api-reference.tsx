import { Box, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import hostedApiData from '../api-reference/assets/hosted-api-docs.json';
import privateApiData from '../api-reference/assets/private-api-docs.json';
import PageNav from '../api-reference/components/nav/desktop-page-nav';
import groupBySubsection from '../api-reference/components/nav/utils/group-by-section';
import useHydrateArticles from '../api-reference/hooks/use-hydrate-articles';
import getArticles from '../api-reference/utils/get-articles';
import Articles from './components/articles/articles';

const staticHostedArticles = getArticles(hostedApiData);
const staticPrivateArticles = getArticles(privateApiData);

const ApiReference = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.internal-api-reference',
  });
  const hostedArticles = useHydrateArticles(staticHostedArticles);
  const privateArticles = useHydrateArticles(staticPrivateArticles);
  const sections = [
    {
      title: t('sections.hosted'),
      isPreview: true,
      subsections: groupBySubsection(hostedArticles),
    },
    {
      title: t('sections.private'),
      isPreview: true,
      subsections: groupBySubsection(privateArticles),
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
