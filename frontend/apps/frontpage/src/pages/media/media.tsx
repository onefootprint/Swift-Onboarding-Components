import { useTranslation } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
        <Hero>
          <Typography variant="display-2" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h2" color="secondary">
            {t('subtitle')}
          </Typography>
        </Hero>
        <Articles>
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

const Hero = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[10]};
    padding: 0 ${theme.spacing[5]};
    text-align: center;
  `}
`;

const Articles = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    article:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default Media;
