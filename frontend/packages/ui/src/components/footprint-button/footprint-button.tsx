import { IcoFootprint24 } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';

import Button, { ButtonProps } from '../button';

export type FootprintButtonProps = Omit<ButtonProps, 'children' | 'variant'> & {
  text?: string;
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
    {text}
  </Button>
);

const StyledIcoFootprint = styled(IcoFootprint24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]}px;
  `}
`;

export default FootprintButton;
