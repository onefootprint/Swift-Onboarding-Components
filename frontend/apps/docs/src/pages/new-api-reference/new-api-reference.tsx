import { Box, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Seo from 'src/components/seo/seo';
import styled, { css } from 'styled-components';

import Cmd from '../api-reference/components/cmd';
import DesktopPageNav from '../api-reference/components/nav/desktop-page-nav';
import MobilePageNav from '../api-reference/components/nav/mobile-page-nav';

import { useEffect } from 'react';
import getSectionMeta from 'src/utils/section';
import staticApiData from '../api-reference/assets/public-api-docs.json';
import useHydrateArticles from '../api-reference/hooks';
import getArticles from '../api-reference/utils/get-articles';
import Articles from './components/articles';
import { ApiArticleProps, ApiReferenceArticle } from './index.page';

const staticApiArticles = getArticles(staticApiData);

export type NewApiReferenceProps = {
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
export const NewApiReference = ({ articles }: NewApiReferenceProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const publicApiArticles = useHydrateArticles(staticApiArticles);
  useEffect(() => {
    // Alert if there's a new public API that isn't visible
    const allDocumentedApis = articles.flatMap(article => article.data.apis);
    const undocumentedApis = publicApiArticles.filter(
      api => !allDocumentedApis.some(docApi => docApi.method === api.method && docApi.path === api.path),
    );
    if (undocumentedApis.length) {
      const undocumentedApisList = undocumentedApis.map(api => ({
        method: api.method,
        path: api.path,
      }));
      console.error(`Found undocumented APIs: ${JSON.stringify(undocumentedApisList)}`);
    }
  }, [articles, publicApiArticles]);

  const findArticle = ({ method, path }: ApiArticleProps) =>
    publicApiArticles.find(api => api.method === method && api.path === path);

  const sections = articles.map(article => ({
    content: article.content,
    title: article.data.title,
    id: getSectionMeta(article.data.title).id,
    apiArticles: article.data.apis.map(api => {
      const article = findArticle(api);
      if (!article) {
        throw Error(`No article found for ${api.method} ${api.path}`);
      }
      if (!api.title) {
        throw Error(`No title found for ${api.method} ${api.path}`);
      }
      return {
        title: api.title,
        api: article,
      };
    }),
  }));

  // Nav was built for multiple larger sections, but we only have one. Can probably remove this
  const section = {
    title: t('sections.footprint-api'),
    isPreview: false,
    subsections: sections,
  };
  const navSections = [section];

  return (
    <Box>
      <Seo title={t('html-title')} slug="/new-api-reference" />
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
