import { IcoFootprint24 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import Button, { ButtonProps } from '../button';
import Typography from '../typography';
import { FootprintButtonSize } from './footprint-button.types';
import footprintButtonFontVariantBySize from './footprint-button.utils';

export type FootprintButtonProps = Omit<
  ButtonProps,
  'children' | 'variant' | 'size'
> & {
  text?: string;
  size?: FootprintButtonSize;
};

const FootprintButton = ({
  disabled = false,
  fullWidth,
  onClick,
  size = 'default',
  testID,
  type = 'button',
  text = 'Verify with Footprint',
  loading,
  loadingAriaLabel,
}: FootprintButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    loading={loading}
    loadingAriaLabel={loadingAriaLabel}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    variant="primary"
  >
    <StyledIcoFootprint color="septenary" />
    <Typography
      color="quinary"
      variant={footprintButtonFontVariantBySize[size]}
    >
      {text}
    </Typography>
  </Button>
);

const StyledIcoFootprint = styled(IcoFootprint24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
  `}
`;

export default FootprintButton;
