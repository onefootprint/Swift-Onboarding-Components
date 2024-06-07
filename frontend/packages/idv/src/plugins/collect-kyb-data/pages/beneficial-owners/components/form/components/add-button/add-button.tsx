import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type AddButtonProps = {
  onClick: () => void;
};

const AddButton = ({ onClick }: AddButtonProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form',
  });

  return (
    <LinkButton iconComponent={IcoPlusSmall16} iconPosition="left" onClick={onClick} $marginBottom={2}>
      {t('add-more')}
    </LinkButton>
  );
};

export default AddButton;
