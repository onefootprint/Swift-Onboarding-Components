import { IcoFileText16 } from '@onefootprint/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Section from '../section';

const Ocr = () => {
  const { t } = useTranslation('user-details', {
    keyPrefix: 'ocr',
  });

  return (
    <Section title={t('title')} IconComponent={IcoFileText16} id={t('title')}>
      <div />
    </Section>
  );
};

export default Ocr;
