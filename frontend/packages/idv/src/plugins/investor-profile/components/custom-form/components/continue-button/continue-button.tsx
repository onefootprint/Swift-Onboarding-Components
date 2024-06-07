import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ContinueButtonProps = {
  isLoading?: boolean;
  label?: string;
};

const ContinueButton = ({ label, isLoading }: ContinueButtonProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'investor-profile.components.continue-button',
  });

  return (
    <Button type="submit" fullWidth loading={isLoading} loadingAriaLabel={t('loading-aria-label')} size="large">
      {label || t('label')}
    </Button>
  );
};

export default ContinueButton;
