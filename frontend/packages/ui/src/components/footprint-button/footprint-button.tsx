import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import React from 'react';
import styled, { css } from 'styled-components';

import Button, { ButtonProps } from '../button';

export type FootprintButtonProps = Omit<ButtonProps, 'children' | 'variant'>;

const FootprintButton = ({
  disabled = false,
  fullWidth,
  onClick,
  size = 'default',
  testID,
  type = 'button',
}: FootprintButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    variant="primary"
  >
    <StyledIcoFootprint color="senary" />
    Verify with Footprint
  </Button>
);

const StyledIcoFootprint = styled(IcoFootprint24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]}px;
  `}
`;

export default FootprintButton;
