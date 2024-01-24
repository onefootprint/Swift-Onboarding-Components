import { IcoSmartphone224 } from '@onefootprint/icons';
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
      <Container
        sx={{
          marginTop: 12,
        }}
      >
        <Title
          icon={IcoSmartphone224}
          title={t('title')}
          subtitle={t('subtitle')}
        />
      </Container>
      <CardGrid />
    </>
  );
};

export default EndlessBenefits;
