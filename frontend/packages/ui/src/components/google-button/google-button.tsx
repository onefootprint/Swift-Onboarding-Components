import { IcoGoogle24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ButtonProps } from '../button';
import Button from '../button';

type OverrideButtonProps = {
  children?: string;
};

export type GoogleButtonProps = Omit<ButtonProps, 'variant'> &
  OverrideButtonProps;

const GoogleButton = ({
  children,
  disabled,
  fullWidth,
  loading,
  loadingAriaLabel,
  onClick,
  size,
  testID,
  type,
}: GoogleButtonProps) => {
  const { t } = useTranslation('ui');

  return (
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
      {children ?? t('components.google-button.text-default')}
    </Button>
  );
};

const StyledIcon = styled(IcoGoogle24)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
  `}
`;

export default GoogleButton;
