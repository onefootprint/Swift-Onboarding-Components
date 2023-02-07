import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import Fieldset from '../fieldset';
import Form from './components/form';

export type WebsiteProps = {
  value?: string | null;
};

const Website = ({ value }: WebsiteProps) => {
  const { t } = useTranslation('pages.settings.business-profile.website');

  return (
    <Fieldset label={t('label')} value={value}>
      {({ id, handleSubmit }) => (
        <Form
          id={id}
          value={value}
          onSubmit={(newWebsite: string) =>
            handleSubmit({ websiteUrl: newWebsite })
          }
        />
      )}
    </Fieldset>
  );
};

export default Website;
