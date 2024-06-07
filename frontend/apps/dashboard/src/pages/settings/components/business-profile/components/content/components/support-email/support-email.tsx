import React from 'react';
import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';
import Form from './components/form';

export type SupportEmailProps = {
  value?: string | null;
};
const SupportEmail = ({ value }: SupportEmailProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-email',
  });

  return (
    <Fieldset label={t('label')} value={value} deleteKey={value ? 'clear_support_email' : undefined}>
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          value={value || ''}
          onSubmit={(newSupportEmail: string) => handleSubmit({ supportEmail: newSupportEmail })}
        />
      )}
    </Fieldset>
  );
};

export default SupportEmail;
