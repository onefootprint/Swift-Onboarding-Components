import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';

type AddButtonProps = {
  onClick: () => void;
};

const AddButton = ({ onClick }: AddButtonProps) => {
  const { t } = useTranslation('pages.onboarding.invite');

  return (
    <LinkButton
      iconComponent={IcoPlusSmall16}
      iconPosition="left"
      onClick={onClick}
      size="compact"
    >
      {t('add-more')}
    </LinkButton>
  );
};

export default AddButton;
