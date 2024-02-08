import React from 'react';
import { useTranslation } from 'react-i18next';

import Fieldset from '../fieldset';
import Form from './components/form';

export type SupportPhoneProps = {
  value?: string | null;
};

const SupportPhone = ({ value }: SupportPhoneProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.support-phone',
  });

  return (
    <Fieldset label={t('label')} value={value} deleteKey="clear_support_phone">
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          value={value}
          onSubmit={(newSupportPhone: string) =>
            handleSubmit({ supportPhone: newSupportPhone })
          }
        />
      )}
    </Fieldset>
  );
};

export default SupportPhone;
