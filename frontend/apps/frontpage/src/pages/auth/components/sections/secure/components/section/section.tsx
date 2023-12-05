import styled, { css } from '@onefootprint/styled';
import { Grid, media, Typography } from '@onefootprint/ui';
import React from 'react';

type SectionProps = {
  title: string;
  subtitle: string;
  image: React.ReactNode;
  inverted?: boolean;
};
const Section = ({ title, subtitle, image, inverted }: SectionProps) => (
  <ResponsiveGridContainer justifyContent="center" alignItems="center">
    <Text direction="column" gap={2} inverted={inverted}>
      <Typography variant="heading-2">{title}</Typography>
      <Typography variant="body-1">{subtitle}</Typography>
    </Text>
    <Image inverted={inverted}>{image}</Image>
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

const Text = styled(Grid.Item)<{ inverted?: boolean }>`
  ${({ theme, inverted }) => css`
    grid-area: text;
    white-space: pre-line;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[9]};
      grid-area: ${inverted ? 'image' : 'text'};
    `}
  `}
`;

const Image = styled(Grid.Item)<{ inverted?: boolean }>`
  ${({ theme, inverted }) => css`
    grid-area: image;

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[9]};
      grid-area: ${inverted ? 'text' : 'image'};
      
    `}
  `}
`;

export default Section;
