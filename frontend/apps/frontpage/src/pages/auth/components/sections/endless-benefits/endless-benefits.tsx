import { Container } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Title from '../../title';
import CardGrid from './components/card-grid';

const EndlessBenefits = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth.endless-benefits',
  });
  return (
    <>
      <Container marginTop={12}>
        <Title
          iconSrc="/auth/icons/ico-illustrated-heart-40.svg"
          title={t('title')}
          subtitle={t('subtitle')}
        />
      </Container>
      <CardGrid />
    </>
  );
};

export default EndlessBenefits;
