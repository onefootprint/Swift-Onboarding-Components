import { Grid, Text, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionProps = {
  title: string;
  subtitle: string;
  image: React.ReactNode;
  $inverted?: boolean;
};
const Section = ({ title, subtitle, image, $inverted }: SectionProps) => (
  <ResponsiveGridContainer justifyContent="center" alignItems="center">
    <StyledGridItem direction="column" gap={2} $inverted={$inverted}>
      <Text variant="heading-2">{title}</Text>
      <Text variant="body-1">{subtitle}</Text>
    </StyledGridItem>
    <Image $inverted={$inverted}>{image}</Image>
  </ResponsiveGridContainer>
);

const ResponsiveGridContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    grid-row-gap: ${theme.spacing[8]};
    grid-template-areas:
      'image'
      'text';

    ${media.greaterThan('md')`
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'text image';
    `}
  `}
`;

const StyledGridItem = styled(Grid.Item)<{ $inverted?: boolean }>`
  ${({ theme, $inverted }) => css`
    grid-area: text;
    white-space: pre-line;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[9]};
      grid-area: ${$inverted ? 'image' : 'text'};
    `}
  `}
`;

const Image = styled(Grid.Item)<{ $inverted?: boolean }>`
  ${({ theme, $inverted }) => css`
    grid-area: image;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[9]};
      grid-area: ${$inverted ? 'text' : 'image'};
    `}
  `}
`;

export default Section;
