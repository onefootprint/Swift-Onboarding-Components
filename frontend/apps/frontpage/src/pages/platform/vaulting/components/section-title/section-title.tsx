import { Box, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  variant: 'display-1' | 'display-2' | 'display-3';
  $maxWidth?: string;
  multiline?: boolean;
  children: React.ReactNode;
};

const SectionTitle = ({ variant, $maxWidth, children, multiline }: SectionTitleProps) => (
  <Box maxWidth={$maxWidth}>
    <Title variant={variant} $multiline={multiline} tag={variant === 'display-1' ? 'h1' : 'h2'}>
      {children}
    </Title>
  </Box>
);

const Title = styled(Box)<{
  variant: 'display-1' | 'display-2' | 'display-3';
  $multiline?: boolean;
}>`
  ${({ theme, variant, $multiline }) => css`
    ${createFontStyles(variant)}
    text-align: center;
    background-size: 200%;
    background-image: linear-gradient(
      180deg,
      ${theme.color.primary} 0%,
      ${theme.color.primary} 80%,
      ${theme.backgroundColor.transparent} 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    ${media.greaterThan('md')`
      ${createFontStyles(variant)}
      ${
        $multiline
          ? `
            background-image: linear-gradient(
            180deg,
            ${theme.color.primary} 0%,
            ${theme.color.primary} 75%,
            ${theme.backgroundColor.transparent} 95%
        );`
          : `
          background-image: linear-gradient(
            180deg,
            ${theme.color.primary} 0%,
            ${theme.color.primary} 50%,
            ${theme.backgroundColor.transparent} 100%
          );
          `
      }
    `}
  `}
`;

export default SectionTitle;
