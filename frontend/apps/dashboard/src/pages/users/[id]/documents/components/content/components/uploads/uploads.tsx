import { IcoUpload24 } from '@onefootprint/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Section from '../section/section';

const Uploads = () => {
  const { t } = useTranslation('user-details', { keyPrefix: 'uploads' });

  return (
    <Section title={t('title')} IconComponent={IcoUpload24} id={t('title')}>
      <div />
    </Section>
  );
};

export default Uploads;
