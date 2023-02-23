import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';

const Name = () => {
  const { t } = useTranslation('pages.proxy-configs.create.form');

  return (
    <TextInput label={t('name.label')} placeholder={t('name.placeholder')} />
  );
};

export default Name;
