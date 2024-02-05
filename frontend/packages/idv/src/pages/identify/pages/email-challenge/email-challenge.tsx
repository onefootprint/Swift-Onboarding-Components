import styled, { css } from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ChallengeHeader from '../../components/challenge-header';
import DifferentAccount from '../../components/different-account';
import { useIdentifyMachine } from '../../components/machine-provider';
import PinVerification from '../../components/pin-verification';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 100 : 1500;

const EmailChallenge = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.pages.email-challenge',
  });
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    config,
    identify: { userFound, email = '', isUnverified, successfulIdentifier },
  } = state.context;
  const isBootstrap = !!bootstrapData?.email;
  const { ShouldHideBootstrappedLoginWithDifferent } = useFlags();
  const orgIds = new Set<string>(ShouldHideBootstrappedLoginWithDifferent);
  const loginWithDifferent = !orgIds.has(config.orgId) && isBootstrap;
  const shouldShowWelcomeBack = userFound && !isUnverified;
  const title = shouldShowWelcomeBack ? t('welcome-back-title') : t('title');

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

  // If we enter the email challenge via an auth token identifier, we won't have an email to display
  const formTitle = email
    ? t('prompt-with-email', { email })
    : t('prompt-without-email');

  return (
    <Container>
      <ChallengeHeader
        shouldShowBack={!isBootstrap}
        title={title}
        subtitle={formTitle}
      />
      <PinVerification
        onChallengeSucceed={handleChallengeSucceed}
        preferredChallengeKind={ChallengeKind.email}
        identifier={successfulIdentifier ?? { email }}
      />
      {loginWithDifferent && (
        <DifferentAccount onClick={handleLoginWithDifferent} />
      )}
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

export default EmailChallenge;
