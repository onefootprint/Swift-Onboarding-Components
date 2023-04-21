import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import HeaderTitle from '../../../../../../components/header-title';
import NavigationHeader from '../../../../../../components/navigation-header';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const Header = () => {
  const { t } = useTranslation('pages.phone-identification');
  const [, send] = useIdentifyMachine();

  const handleNavToPrevPage = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <>
      <NavigationHeader
        button={{
          variant: 'back',
          onClick: handleNavToPrevPage,
        }}
      />
      <HeaderTitle
        subtitle={t('subtitle')}
        sx={{ marginBottom: 8 }}
        title={t('title')}
      />
    </>
  );
};

export default Header;
