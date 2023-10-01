import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import React from 'react';

import ChallengeHeader from '../../components/challenge-header';
import LegalFooter from '../../components/legal-footer';
import { useIdentifyMachine } from '../../components/machine-provider';
import PinVerification from '../../components/pin-verification';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 0 : 1500;

const EmailChallenge = () => {
  const { t } = useTranslation('pages.email-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    config: { orgName: tenantName },
    bootstrapData,
    identify: { userFound, email = '' },
  } = state.context;
  const isBootstrap = !!bootstrapData?.email;
  const title = userFound ? t('welcome-back-title') : t('title');
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName })
      : t('subtitle');

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

  return (
    <Container>
      <ChallengeHeader
        shouldShowBack={!isBootstrap}
        title={title}
        subtitle={subtitle}
      />
      <PinVerification
        title={t('prompt', { email })}
        onChallengeSucceed={handleChallengeSuceed}
        preferredChallengeKind={ChallengeKind.email}
        identifier={{ email }}
      />
      {isBootstrap && <LegalFooter />}
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
