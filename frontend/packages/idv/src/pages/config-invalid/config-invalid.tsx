import { useTranslation } from '@onefootprint/hooks';
import { HeaderTitle, NavigationHeader } from '@onefootprint/idv-elements';
import React from 'react';

const ConfigInvalid = () => {
  const { t } = useTranslation('pages.config-invalid');

  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </>
  );
};

export default ConfigInvalid;
