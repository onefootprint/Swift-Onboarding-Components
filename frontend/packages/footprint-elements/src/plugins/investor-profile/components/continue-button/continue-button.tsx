import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';

type ContinueButtonProps = {
  isLoading?: boolean;
};

const ContinueButton = ({ isLoading }: ContinueButtonProps) => {
  const { allT } = useTranslation('pages.investment-goals.form');

  return (
    <Button type="submit" fullWidth loading={isLoading}>
      {allT('pages.cta-continue')}
    </Button>
  );
};

export default ContinueButton;
