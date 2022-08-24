import React from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
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
      {children}
    </InlineAlertContainer>
  );
};

const InlineAlertContainer = styled.div<{
  variant: InlineAlertVariant;
  sx: SXStyles;
}>`
  ${({ theme, variant }) => css`
    ${createFontStyles('body-2')};
    ${createVariantStyles(variant)};
    border-radius: ${theme.borderRadius[2]}px;
    display: flex;
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    width: 100%;
  `};

  ${({ sx }) => css`
    ${sx};
  `}
`;

export default InlineAlert;
