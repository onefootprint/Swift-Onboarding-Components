import { ChallengeKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';

import getCanChallengeBiometrics from '../../../../utils/get-can-challenge-biometrics';
import getScrubbedPhoneNumber from '../../../../utils/get-scrubbed-phone-number';
import ChallengeHeader from '../../components/challenge-header';
import DifferentAccount from '../../components/different-account';
import PinVerification from '../../components/pin-verification';
import useIdentifyMachine from '../../hooks/use-identify-machine';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const SmsChallenge = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.pages.sms-challenge',
  });
  const [state, send] = useIdentifyMachine();
  const {
    initialAuthToken,
    bootstrapData,
    config,
    challenge: { challengeData, hasSyncablePassKey, availableChallengeKinds },
    device,
    identify: {
      phoneNumber = '',
      successfulIdentifier,
      userFound,
      isUnverified,
    },
  } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const { ShouldHideBootstrappedLoginWithDifferent } = useFlags();
  const orgIds = new Set<string>(ShouldHideBootstrappedLoginWithDifferent);
  const loginWithDifferent = !orgIds.has(config.orgId) && isBootstrap;
  const hasInitialAuthToken = !!initialAuthToken;
  const shouldShowWelcomeBack = userFound && !isUnverified;
  const title = shouldShowWelcomeBack ? t('welcome-back-title') : t('title');

  // Either scrub the phone number collected from the previous steps, or use the
  // challenge data scrubbed number
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    successfulIdentifier,
    phoneNumber,
    challengeData,
  });
  // Sometimes, a new challenge may not have been re-generated upon mount because
  // of rate limiting (they recently sent a code), to avoid shifting the components
  // up and down, still show a generic title if we don't have the scrubbed phone number.
  // The user can always resend the code if they didn't already receive it.
  const formTitle = scrubbedPhoneNumber
    ? t('prompt-with-phone', { scrubbedPhoneNumber })
    : t('prompt-without-phone');

  const handleChallengeSucceed = (authToken: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handleLoginWithDifferent = () => {
    send({
      type: 'identifyReset',
    });
  };

  const shouldShowBack =
    (!isBootstrap && !hasInitialAuthToken) ||
    getCanChallengeBiometrics(
      availableChallengeKinds,
      hasSyncablePassKey,
      device,
    );

  return (
    <Stack direction="column" justify="center" align="center" gap={7}>
      <ChallengeHeader
        shouldShowBack={shouldShowBack}
        title={title}
        subtitle={formTitle}
      />
      <PinVerification
        onChallengeSucceed={handleChallengeSucceed}
        preferredChallengeKind={ChallengeKind.sms}
        identifier={successfulIdentifier ?? { phoneNumber }}
      />
      {loginWithDifferent && (
        <DifferentAccount onClick={handleLoginWithDifferent} />
      )}
    </Stack>
  );
};

export default SmsChallenge;
