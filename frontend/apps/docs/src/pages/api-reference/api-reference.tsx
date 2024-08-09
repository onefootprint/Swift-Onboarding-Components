import { Box, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo/seo';
import styled, { css } from 'styled-components';

import Cmd from './components/cmd';
import DesktopPageNav from './components/nav/desktop-page-nav';
import MobilePageNav from './components/nav/mobile-page-nav';

import Articles from './components/articles';
import useParseApiSections from './hooks/use-parse-api-sections';
import { ApiReferenceArticle } from './index.page';

export type ApiReferenceProps = {
  articles: ApiReferenceArticle[];
};

/**
 * Renders documentation for public facing APIs.
 * The documentation is composed from two different sources:
 * - The markdown files in src/content/api-reference
 * - The open API specs generated from the backend
 *
 * Each markdown file defines a "section" on the docs site and has generalized information on the section of
 * APIs. The markdown file also specifies the list of APIs that should be included in the section.
 * We then join the markdown files with the open API specs for the listed APIs and render documentation for
 * each API within the section.
 */
export const ApiReference = ({ articles }: ApiReferenceProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });

  const parsedApiSections = useParseApiSections(articles);

  // Nav was built for multiple larger sections, but we only have one. Can probably remove this
  const section = {
    title: t('sections.footprint-api'),
    isPreview: false,
    subsections: parsedApiSections,
  };
  const navSections = [section];

  return (
    <Box>
      <Seo title={t('html-title')} slug="/api-reference" />
      <Layout>
        <MobilePageNav sections={navSections} />
        <DesktopPageNav sections={navSections} />
        <Articles sections={navSections} />
      </Layout>
      <Cmd sections={navSections} />
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
