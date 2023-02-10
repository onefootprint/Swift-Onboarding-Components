import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';

const PhoneRegistrationHeader = () => {
  const { t } = useTranslation('pages.phone-registration');
  const [, send] = useIdentifyMachine();

  const handleNavToPrevPage = () => {
    send({ type: Events.navigatedToPrevPage });
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

export default PhoneRegistrationHeader;
