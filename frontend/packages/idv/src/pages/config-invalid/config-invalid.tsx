import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle, NavigationHeader } from '../../components';

const ConfigInvalid = () => {
  const { t } = useTranslation('global.pages.config-invalid');

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </>
  );
};

export default ConfigInvalid;
