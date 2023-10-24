import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Grid, media, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import SEO from '../../components/seo';
import ArticleItem from './components/article-item';
import type { Article } from './media.types';

type MediaProps = {
  articles: Article[];
};

const Media = ({ articles }: MediaProps) => {
  const { t } = useTranslation('pages.media');

  return (
    <>
      <SEO title={t('html-title')} slug="/media" />
      <Container>
        <Grid.Container
          gap={5}
          marginBottom={10}
          paddingTop={0}
          paddingBottom={0}
          paddingLeft={5}
          paddingRight={5}
          textAlign="center"
        >
          <Typography variant="display-2" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h2" color="secondary">
            {t('subtitle')}
          </Typography>
        </Grid.Container>
        <Articles direction="column">
          {articles.map(article => (
            <ArticleItem
              publishedAt={article.publishedAt}
              excerpt={article.excerpt}
              id={article.id}
              imageAlt={article.imageAlt}
              imageUrl={article.imageUrl}
              key={article.id}
              title={article.title}
              url={article.url}
              website={article.website}
            />
          ))}
        </Articles>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto ${theme.spacing[9]};
    max-width: 960px;

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[10]};
    `}
  `}
`;

const Articles = styled(Stack)`
  ${({ theme }) => css`
    article:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default Media;
