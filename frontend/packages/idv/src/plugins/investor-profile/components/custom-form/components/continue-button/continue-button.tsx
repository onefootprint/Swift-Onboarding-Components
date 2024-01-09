import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';

type ContinueButtonProps = {
  isLoading?: boolean;
  label?: string;
};

const ContinueButton = ({ label, isLoading }: ContinueButtonProps) => {
  const { t } = useTranslation('investor-profile.components.continue-button');

  return (
    <Button
      type="submit"
      fullWidth
      loading={isLoading}
      loadingAriaLabel={t('loading-aria-label')}
    >
      {label || t('label')}
    </Button>
  );
};

export default ContinueButton;
