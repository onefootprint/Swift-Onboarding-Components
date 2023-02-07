import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import Fieldset from '../fieldset';
import Form from './components/form';

export type NameProps = {
  value?: string;
};

const Name = ({ value }: NameProps) => {
  const { t } = useTranslation('pages.settings.business-profile.name');

  return (
    <Fieldset label={t('label')} value={value}>
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          onSubmit={(newName: string) => handleSubmit({ name: newName })}
          value={value}
        />
      )}
    </Fieldset>
  );
};

export default Name;
