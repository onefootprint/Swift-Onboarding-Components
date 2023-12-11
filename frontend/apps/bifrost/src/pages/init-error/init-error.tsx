import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import React from 'react';

const InitError = () => {
  const { t } = useTranslation('pages.init-error');

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle
        title={t('invalid-config-title')}
        subtitle={t('invalid-config-description')}
      />
    </>
  );
};

export default InitError;
