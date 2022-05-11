import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

import type { Article } from './articles.types';
import ArticleItem from './components/article-item';

type ArticleProps = {
  titleText: string;
  subtitleText: string;
  items: Article[];
};

const Articles = ({ titleText, subtitleText, items }: ArticleProps) => (
  <Container as="section">
    <Typography
      color="secondary"
      variant="label-1"
      as="h3"
      sx={{ marginBottom: 5 }}
    >
      {subtitleText}
    </Typography>
    <Typography
      color="primary"
      variant="display-2"
      as="h4"
      sx={{ marginBottom: 9, maxWidth: '580px' }}
    >
      {titleText}
    </Typography>
    <Grid>
      {items.map(item => (
        <ArticleItem
          descriptionText={item.descriptionText}
          imageAltText={item.imageAltText}
          imagePath={item.imagePath}
          key={item.titleText}
          titleText={item.titleText}
        />
      ))}
    </Grid>
  </Container>
);

const Grid = styled.ul`
  ${({ theme }) => css`
    display: inline-grid;

    ${media.between('xs', 'sm')`
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: 3 1fr;
      row-gap: ${theme.grid.col.gutterSize.xs}px;
    `}

    ${media.between('sm', 'md')`
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: 3 1fr;
      row-gap: ${theme.grid.col.gutterSize.sm}px;
    `}

    ${media.between('md', 'lg')`
      grid-template-columns: repeat(1, 1fr);
      grid-template-rows: 3 1fr;
      row-gap: ${theme.grid.col.gutterSize.md}px;
    `}

    ${media.between('lg', 'xl')`
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1 1fr;
      column-gap: ${theme.grid.col.gutterSize.lg}px;
    `}

    ${media.greaterThan('xl')`
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1 1fr;
      column-gap: ${theme.grid.col.gutterSize.xl}px;
    `}
  `}
`;

export default Articles;
