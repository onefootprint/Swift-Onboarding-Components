import styled, { css } from '@onefootprint/styled';
import React from 'react';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import Box from '../box';
import type { InlineAlertVariant } from './inline-alert.types';
import { createVariantStyles, getIconForVariant } from './inline-alert.utils';

export type InlineAlertProps = {
  children: React.ReactNode;
  variant: InlineAlertVariant;
  sx?: SXStyleProps;
};

const InlineAlert = ({ children, variant = 'info', sx }: InlineAlertProps) => {
  const IconComponent = getIconForVariant(variant);
  const sxStyles = useSX(sx);
  return (
    <InlineAlertContainer sx={sxStyles} role="alert" variant={variant}>
      <Box
        sx={{
          display: 'flex',
          marginRight: 3,
        }}
      >
        <IconComponent color={variant} />
      </Box>
      <ContentContainer variant={variant}>{children}</ContentContainer>
    </InlineAlertContainer>
  );
};

const ContentContainer = styled.div<{
  variant: InlineAlertVariant;
}>`
  ${({ variant }) => css`
    ${createVariantStyles(variant)};
    display: inline-block;
  `};
`;

const InlineAlertContainer = styled.div<{
  variant: InlineAlertVariant;
  sx: SXStyles;
}>`
  ${({ theme, variant }) => css`
    ${createFontStyles('body-3')};
    ${createVariantStyles(variant)};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    width: 100%;

    a,
    button {
      ${createFontStyles('label-3')};
      color: currentColor;
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: underline;

      @media (hover: hover) {
        &:hover {
          color: currentColor;
          opacity: 0.7;
        }
      }

      &:active {
        color: currentColor;
        opacity: 0.85;
      }
    }
  `};

  ${({ sx }) => css`
    ${sx};
  `}
`;

export default InlineAlert;
