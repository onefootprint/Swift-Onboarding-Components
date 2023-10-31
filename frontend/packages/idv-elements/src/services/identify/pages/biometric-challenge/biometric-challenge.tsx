import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';

import ChallengeHeader from '../../components/challenge-header';
import DifferentAccount from '../../components/different-account';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import Biometric from './components/biometric';

const BiometricChallenge = () => {
  const { t } = useTranslation('pages.biometric-challenge');
  const [state, send] = useIdentifyMachine();
  const { initialAuthToken, bootstrapData, config } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const { ShouldHideBootstrappedLoginWithDifferent } = useFlags();
  const orgIds = new Set<string>(ShouldHideBootstrappedLoginWithDifferent);
  const loginWithDifferent = !orgIds.has(config.orgId) && isBootstrap;
  const title = t('title');
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
      {loginWithDifferent && (
        <DifferentAccount onClick={handleLoginWithDifferent} />
      )}
    </Stack>
  );
};

export default BiometricChallenge;
