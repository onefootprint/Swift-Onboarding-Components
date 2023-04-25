import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';

const Header = () => {
  const { t } = useTranslation('pages.email-identification.header');
  return (
    <>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
    </>
  );
};

export default Header;
