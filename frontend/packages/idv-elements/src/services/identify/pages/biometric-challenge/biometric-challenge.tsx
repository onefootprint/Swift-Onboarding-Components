import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import React from 'react';

import ChallengeHeader from '../../components/challenge-header';
import DifferentAccount from '../../components/different-account';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import Biometric from './components/biometric';

const BiometricChallenge = () => {
  const { t } = useTranslation('pages.biometric-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    config: { orgName: tenantName },
    initialAuthToken,
    bootstrapData,
    identify: { userFound },
  } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const title = t('title');
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName })
      : t('subtitle');
  const hasInitialAuthToken = !!initialAuthToken;

  const handleLoginWithDifferent = () => {
    send({
      type: 'identifyReset',
    });
  };

  const handleChangeChallenge = () => {
    send({
      type: 'changeChallengeToSms',
    });
  };

  return (
    <Stack direction="column" gap={7} align="center" justify="center">
      <ChallengeHeader
        shouldShowBack={!isBootstrap && !hasInitialAuthToken}
        title={title}
        subtitle={subtitle}
      />
      <Stack
        direction="column"
        gap={5}
        align="center"
        justify="center"
        sx={{
          width: '100%',
        }}
      >
        <Biometric />
        <Button
          fullWidth
          variant="secondary"
          onClick={handleChangeChallenge}
          prefixIcon={IcoSmartphone24}
        >
          {t('login-with-sms')}
        </Button>
      </Stack>
      {isBootstrap && <DifferentAccount onClick={handleLoginWithDifferent} />}
    </Stack>
  );
};

export default BiometricChallenge;
