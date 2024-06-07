import { HeaderTitle, NavigationHeader } from '@onefootprint/idv';
import React from 'react';
import { useTranslation } from 'react-i18next';

const InitError = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.init-error' });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('invalid-config-title')} subtitle={t('invalid-config-description')} />
    </>
  );
};

export default InitError;
