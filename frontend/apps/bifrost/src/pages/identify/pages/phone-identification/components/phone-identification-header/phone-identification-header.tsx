import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useIdentifyMachine from 'src/hooks/use-identify-machine';

const PhoneIdentificationHeader = () => {
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

export default PhoneIdentificationHeader;
