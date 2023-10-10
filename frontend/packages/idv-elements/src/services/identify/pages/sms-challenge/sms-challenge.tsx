import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { ChallengeData } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';

import ChallengeHeader from '../../components/challenge-header';
import DifferentAccount from '../../components/different-account';
import PinVerification from '../../components/pin-verification';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import { getCanChallengeBiometrics } from '../../utils/biometrics';
import getScrubbedPhoneNumber from '../../utils/get-scrubbed-phone-number';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 0 : 1500;

const SmsChallenge = () => {
  const { t } = useTranslation('pages.sms-challenge');
  const [state, send] = useIdentifyMachine();
  const [challengeData, setChallengeData] = useState<ChallengeData>();
  const {
    config: { orgName: tenantName },
    initialAuthToken,
    bootstrapData,
    challenge,
    device,
    identify: { phoneNumber = '', successfulIdentifier, userFound },
  } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const hasInitialAuthToken = !!initialAuthToken;
  const title = userFound ? t('welcome-back-title') : t('title');
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName })
      : t('subtitle');

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

  const handleChallengeSuceed = (authToken: string) => {
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

  const handleReceiveChallengeData = (data: ChallengeData) => {
    setChallengeData(data);
  };

  const shouldShowBack =
    (!isBootstrap && !hasInitialAuthToken) ||
    getCanChallengeBiometrics(challenge, device);

  return (
    <Container>
      <ChallengeHeader
        shouldShowBack={shouldShowBack}
        title={title}
        subtitle={subtitle}
      />
      <PinVerification
        title={formTitle}
        onReceiveChallenge={handleReceiveChallengeData}
        onChallengeSucceed={handleChallengeSuceed}
        preferredChallengeKind={ChallengeKind.sms}
        identifier={successfulIdentifier ?? { phoneNumber }}
      />
      {isBootstrap && <DifferentAccount onClick={handleLoginWithDifferent} />}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[7]};
  `}
`;

export default SmsChallenge;
