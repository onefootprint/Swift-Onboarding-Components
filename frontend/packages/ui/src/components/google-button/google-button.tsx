import { IcoGoogle24 } from '@onefootprint/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ButtonProps } from '../button';
import Button from '../button';

type OverrideButtonProps = {
  children?: string;
};

export type GoogleButtonProps = Omit<ButtonProps, 'variant'> & OverrideButtonProps;

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
      prefixIcon={IcoGoogle24}
    >
      {children ?? t('components.google-button.children-default')}
    </Button>
  );
};

export default GoogleButton;
