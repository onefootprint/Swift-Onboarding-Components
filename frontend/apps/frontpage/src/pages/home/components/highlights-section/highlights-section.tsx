import { Container, media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import HighlightItem from './components/highlight-item';
import type { Highlight } from './highlight-section.types';

type HighlightSectionProps = {
  items: Highlight[];
  subtitle: string;
  title: string;
};

const HighlightSection = ({
  title,
  subtitle,
  items,
}: HighlightSectionProps) => (
  <Container as="section" sx={{ zIndex: 1 }}>
    <Typography
      color="secondary"
      variant="label-1"
      as="h3"
      sx={{ marginBottom: 5 }}
    >
      {subtitle}
    </Typography>
    <Typography
      as="h4"
      color="primary"
      sx={{ marginBottom: 9, maxWidth: '580px' }}
      variant="display-2"
    >
      {title}
    </Typography>
    <ItemsContainer>
      {items.map(item => (
        <HighlightItem
          content={item.content}
          imgAlt={item.imgAlt}
          imgSrc={item.imgSrc}
          key={item.title}
          title={item.title}
        />
      ))}
    </ItemsContainer>
  </Container>
);

const ItemsContainer = styled.div`
  ${({ theme }) => css`
    z-index: 1;
    display: inline-grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: 3 1fr;
    row-gap: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1 1fr;
      column-gap: ${theme.spacing[5]}px;
    `}
  `}
`;

export default HighlightSection;
