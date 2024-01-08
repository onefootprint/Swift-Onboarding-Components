import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';

type AddButtonProps = {
  onClick: () => void;
};

const AddButton = ({ onClick }: AddButtonProps) => {
  const { t } = useTranslation('pages.kyb.beneficial-owners.form');

  return (
    <LinkButton
      iconComponent={IcoPlusSmall16}
      iconPosition="left"
      onClick={onClick}
      size="compact"
      sx={{ marginBottom: 2 }}
    >
      {t('add-more')}
    </LinkButton>
  );
};

export default AddButton;
