import React from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
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
      <IconComponent color={variant} />
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
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    text-align: center;
    display: flex;
    align-items: center;
    width: 100%;
    border-radius: ${theme.borderRadius[2]}px;

    > :first-child {
      margin-right: ${theme.spacing[3]}px;
    }
  `};

  ${({ sx }) => css`
    ${sx};
  `}
`;

export default InlineAlert;
