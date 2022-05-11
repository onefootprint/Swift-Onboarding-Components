import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

import type { Characteristic } from './characteristics.types';
import CharacteristicItem from './components/characteristic-item';

type CharacteristicsProps = {
  titleText: string;
  subtitleText: string;
  articles: Characteristic[];
};

const Characteristics = ({
  titleText,
  subtitleText,
  articles,
}: CharacteristicsProps) => (
  <Container as="section">
    <Typography
      color="tertiary"
      variant="heading-3"
      as="h4"
      sx={{ marginBottom: 5 }}
    >
      {subtitleText}
    </Typography>
    <Typography
      color="primary"
      variant="display-2"
      as="h3"
      sx={{ marginBottom: 9, maxWidth: '500px' }}
    >
      {titleText}
    </Typography>
    <Grid>
      {articles.map(article => (
        <CharacteristicItem
          descriptionText={article.descriptionText}
          imageAltText={article.imageAltText}
          imagePath={article.imagePath}
          titleText={article.titleText}
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

export default Characteristics;
