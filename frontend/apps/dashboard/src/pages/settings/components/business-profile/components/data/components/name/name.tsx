import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import Fieldset from '../fieldset';

export type NameProps = {
  value?: string;
};

const Name = ({ value }: NameProps) => {
  const { t } = useTranslation('pages.settings.business-profile.name');

  return (
    <Fieldset
      addLabel={t('add')}
      editLabel={t('edit')}
      label={t('label')}
      value={value}
    />
  );
};

export default Name;
