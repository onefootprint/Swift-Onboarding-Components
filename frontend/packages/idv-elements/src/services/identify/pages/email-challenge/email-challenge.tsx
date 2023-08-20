import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import ChallengeHeader from '../../components/challenge-header';
import { useIdentifyMachine } from '../../components/identify-machine-provider';
import LegalFooter from '../../components/legal-footer';

const EmailChallenge = () => {
  const { t } = useTranslation('pages.email-challenge');
  const [state] = useIdentifyMachine();
  const {
    config,
    bootstrapData,

    identify: { userFound },
  } = state.context;
  const isBootstrap = !!bootstrapData?.email;
  const title = userFound ? t('welcome-back-title') : t('title');
  const subtitle =
    isBootstrap && userFound
      ? t('bootstrap-subtitle', { tenantName: config?.orgName })
      : t('subtitle');

  return (
    <Container>
      <ChallengeHeader
        shouldShowBack={isBootstrap}
        title={title}
        subtitle={subtitle}
      />
      {/* <PinVerification
        title={formTitle}
        onReceiveChallenge={handleReceiveChallengeData}
        onChallengeSucceed={handleChallengeSuceed}
        preferredChallengeKind={ChallengeKind.sms}
      /> */}
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
