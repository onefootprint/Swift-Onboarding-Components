import { Box, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import ApiArticle from 'src/pages/api-reference/components/api-article';
import Cmd from 'src/pages/api-reference/components/cmd';
import MobilePageNav from 'src/pages/api-reference/components/nav/mobile-page-nav';
import { PageNavSection } from 'src/pages/api-reference/components/nav/nav.types';
import { HydratedApiArticle } from 'src/pages/api-reference/hooks/use-hydrate-articles';
import { ARTICLES_CONTAINER_ID } from '../../api-reference/components/articles';
import DesktopPageNav from '../../api-reference/components/nav/desktop-page-nav';
import ApiTitle from './api-title';

type InternalApiDocsPageProps = {
  apis: HydratedApiArticle[];
};

/**
 * Our internal API reference doesn't have a manual grouping of APIs like our external API reference does.
 * So we'll automatically group APIs by the first tag in their open API spec.
 */
const groupBySubsection = (apiArticles: HydratedApiArticle[]) => {
  const sections: Record<string, HydratedApiArticle[]> = {};
  apiArticles.forEach(api => {
    if (!sections[api.section]) {
      sections[api.section] = [];
    }
    sections[api.section].push(api);
  });
  return Object.entries(sections)
    .toSorted()
    .map(([title, subsections]) => ({
      title,
      subsections,
    }));
};

const InternalApiDocsPage = ({ apis }: InternalApiDocsPageProps) => {
  const sections = groupBySubsection(apis);

  const navSections: PageNavSection[] = sections.map(section => ({
    title: section.title.charAt(0).toUpperCase() + section.title.slice(1),
    subsections: section.subsections.map(api => ({
      title: <ApiTitle api={api} />,
      id: api.id,
      api,
    })),
  }));

  return (
    <Box>
      <Layout>
        <MobilePageNav sections={navSections} />
        <DesktopPageNav sections={navSections} />
        <ArticleList id={ARTICLES_CONTAINER_ID}>
          {sections
            .flatMap(s => s.subsections)
            .map(api => (
              <ApiArticle key={api.id} article={{ api }} />
            ))}
        </ArticleList>
      </Layout>
      <Cmd sections={navSections} />
    </Box>
  );
};

const ArticleList = styled.section`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    grid-area: content;
    min-height: 100%;
    display: flex;
    color: black;
    flex-direction: column;
    overflow-y: auto;
    margin-top: var(--header-height);

    ${media.greaterThan('md')`
      margin-top: 0;
    `}
  `}
`;

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

export default InternalApiDocsPage;
