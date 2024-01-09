import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';

type CtaButtonProps = {
  isLoading?: boolean;
  label?: string;
};

const CtaButton = ({ label, isLoading }: CtaButtonProps) => {
  const { t } = useTranslation('kyc.pages.cta');

  return (
    <Button type="submit" fullWidth loading={isLoading}>
      {label ?? t('continue')}
    </Button>
  );
};

export default CtaButton;
