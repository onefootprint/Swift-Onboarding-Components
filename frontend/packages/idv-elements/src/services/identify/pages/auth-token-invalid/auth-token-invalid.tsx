import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';

const AuthTokenInvalid = () => {
  const { t } = useTranslation('identify.pages.auth-token-invalid');
  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
    </>
  );
};

export default AuthTokenInvalid;
