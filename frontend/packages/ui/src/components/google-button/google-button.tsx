import IcoGoogleColored24 from 'icons/ico/ico-google-colored-24';
import React from 'react';
import styled, { css } from 'styled';

import Button, { ButtonProps } from '../button';

type OverrideButtonProps = {
  children?: string;
};

export type GoogleButtonProps = Omit<ButtonProps, 'variant'> &
  OverrideButtonProps;

const GoogleButton = ({
  children = 'Continue with Google',
  disabled,
  fullWidth,
  loading,
  loadingAriaLabel,
  onClick,
  size,
  testID,
  type,
}: GoogleButtonProps) => (
  <Button
    disabled={disabled}
    fullWidth={fullWidth}
    loading={loading}
    loadingAriaLabel={loadingAriaLabel}
    onClick={onClick}
    size={size}
    testID={testID}
    type={type}
    variant="secondary"
  >
    <StyledIcon />
    {children}
  </Button>
);

const StyledIcon = styled(IcoGoogleColored24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]}px;
  `}
`;

export default GoogleButton;
