import { Box, media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import ApiArticle from 'src/pages/api-reference/components/api-article';
import Cmd from 'src/pages/api-reference/components/cmd';
import { HydratedApiArticle } from 'src/pages/api-reference/hooks/use-hydrate-articles';
import { ARTICLES_CONTAINER_ID } from '../../api-reference/components/articles';
import PageNav from '../../api-reference/components/nav/desktop-page-nav';
import groupBySubsection from '../../api-reference/components/nav/utils/group-by-section';

type InternalApiDocsPageProps = {
  title: string;
  apis: HydratedApiArticle[];
};

const InternalApiDocsPage = ({ title, apis }: InternalApiDocsPageProps) => {
  const sections = [
    {
      title,
      isPreview: true,
      subsections: groupBySubsection(apis),
    },
  ];
  const apiArticles = sections.flatMap(s => s.subsections).flatMap(s => s.apiArticles);

  return (
    <Box>
      <Layout>
        <PageNav sections={sections} />
        <ArticleList id={ARTICLES_CONTAINER_ID}>
          {apiArticles.map(article => (
            <ApiArticle key={article.api.id} article={article} />
          ))}
        </ArticleList>
      </Layout>
      <Cmd sections={sections} />
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
