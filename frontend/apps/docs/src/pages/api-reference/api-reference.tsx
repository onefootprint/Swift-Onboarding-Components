import { Box, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo/seo';
import styled, { css } from 'styled-components';

import Cmd from './components/cmd';
import DesktopPageNav from './components/nav/desktop-page-nav';
import MobilePageNav from './components/nav/mobile-page-nav';

import Articles from './components/articles';
import type { PageNavSection } from './components/nav/nav.types';
import useParseApiSections from './hooks/use-parse-api-sections';
import type { ApiReferenceArticle, IntroductionArticle } from './index.page';

export type ApiReferenceProps = {
  introductionSections: IntroductionArticle[];
  apiSections: ApiReferenceArticle[];
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
export const ApiReference = ({ introductionSections, apiSections }: ApiReferenceProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });

  // We won't have multiple sections of written content on this docs site, so we just hardcode.
  const introductionNavSection = {
    title: undefined,
    subsections: introductionSections.map(s => ({
      title: s.title,
      id: s.id,
    })),
  };

  const parsedApiSections = useParseApiSections(apiSections);
  const apiNavSections: PageNavSection[] = parsedApiSections
    .filter(section => section.subsections.some(subsection => !subsection.api.isHidden))
    .map(section => ({
      title: section.title,
      id: section.id,
      subsections: section.subsections
        .filter(subsection => !subsection.api.isHidden)
        .map(subsection => ({
          title: subsection.title,
          id: subsection.api.id,
          api: subsection.api,
        })),
    }));
  const navSections = [introductionNavSection, ...apiNavSections];

  return (
    <Box>
      <Seo title={t('html-title')} slug="/api-reference" />
      <Layout>
        <MobilePageNav sections={navSections} />
        <DesktopPageNav sections={navSections} />
        <Articles introductionSections={introductionSections} sections={parsedApiSections} />
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
      grid-template-columns: ${'var(--page-aside-nav-api-reference-width-small)'} minmax(0, 1fr);
      grid-template-areas: 'nav content';
      transition: grid-template-columns 0.3s ease-in-out;
      width: 100%;
    `}
  `}
`;

export default ApiReference;
