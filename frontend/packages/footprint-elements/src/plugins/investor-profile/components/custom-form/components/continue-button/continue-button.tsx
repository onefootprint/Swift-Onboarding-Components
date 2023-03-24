import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';

type ContinueButtonProps = {
  isLoading?: boolean;
};

const ContinueButton = ({ isLoading }: ContinueButtonProps) => {
  const { t } = useTranslation('components.continue-button');

  return (
    <Button
      type="submit"
      fullWidth
      loading={isLoading}
      loadingAriaLabel={t('loading-aria-label')}
    >
      {t('label')}
    </Button>
  );
};

export default ContinueButton;
