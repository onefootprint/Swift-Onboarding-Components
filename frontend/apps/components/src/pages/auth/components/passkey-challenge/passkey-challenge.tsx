import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone24 } from '@onefootprint/icons';
import { StepHeader } from '@onefootprint/idv-elements';
import { Button, Stack } from '@onefootprint/ui';
import React from 'react';

import { useAuthMachine } from '../../state';
import Biometric from '../biometric';

type StepPassKeyProps = { children?: JSX.Element | null };

const PasskeyChallenge = ({ children }: StepPassKeyProps) => {
  const { t } = useTranslation('pages.auth.passkey-challenge');
  const [state, send] = useAuthMachine();
  const { bootstrapData } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);

  const handleChangeChallenge = () => {
    send({ type: 'changeChallengeToSms' });
  };

  const handleBack = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  return (
    <>
      <Stack
        direction="column"
        gap={7}
        align="center"
        justify="center"
        backgroundColor="primary"
      >
        <StepHeader
          title={t('title')}
          leftButton={
            !isBootstrap
              ? { variant: 'back', onBack: handleBack }
              : { variant: 'close' }
          }
        />
        <Stack
          align="center"
          direction="column"
          gap={5}
          justify="center"
          width="100%"
        >
          <Biometric />
          <Button
            fullWidth
            onClick={handleChangeChallenge}
            prefixIcon={IcoSmartphone24}
            variant="secondary"
          >
            {t('login-with-sms')}
          </Button>
        </Stack>
      </Stack>
      {children}
    </>
  );
};

export default PasskeyChallenge;
