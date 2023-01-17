import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import Fieldset from '../fieldset';

export type WebsiteProps = {
  value?: string | null;
};

const Website = ({ value }: WebsiteProps) => {
  const { t } = useTranslation('pages.settings.business-profile.website');

  return (
    <Fieldset
      addLabel={t('add')}
      editLabel={t('edit')}
      label={t('label')}
      value={value}
    />
  );
};

export default Website;
