import { HeaderTitle } from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';
import { Divider } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import LegalFooter from '../../components/legal-footer';
import useIdentifyMachine, { Events } from '../../hooks/use-identify-machine';
import BiometricChallenge from './components/biometric-challenge';
import LoginChallengeSegmentedControl from './components/login-challenge-segmented-control';
import LoginWithDifferentAccount from './components/login-with-different-account';
import SmsChallenge from './components/sms-challenge';

const BootstrapChallenge = () => {
  const { t } = useTranslation('pages.bootstrap-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    device: { type, hasSupportForWebauthn },
    bootstrapData,
    challenge: { availableChallengeKinds },
  } = state.context;

  const [selectedChallengeKind, setSelectedChallengeKind] =
    useState<ChallengeKind>(ChallengeKind.sms);
  const handleChangeChallengeKind = (challengeKind: ChallengeKind) => {
    setSelectedChallengeKind(challengeKind);
  };

  // TODO: add logic for showing the toggle on desktop
  // TODO: add logic for showing the transfer QR code
  // TODO: add logic for showMissingPhoneLabel
  const isMobileDeviceWithWebauthnSupport =
    type === 'mobile' && hasSupportForWebauthn;
  const canChallengeBiometric =
    availableChallengeKinds?.includes(ChallengeKind.biometric) &&
    isMobileDeviceWithWebauthnSupport;

  const handleLoginWithDifferent = () => {
    send({
      type: Events.identifyReset,
    });
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      {canChallengeBiometric && (
        <LoginChallengeSegmentedControl onChange={handleChangeChallengeKind} />
      )}
      {selectedChallengeKind === ChallengeKind.sms && <SmsChallenge />}
      {selectedChallengeKind === ChallengeKind.biometric && (
        <BiometricChallenge />
      )}
      <LegalFooter />
      {bootstrapData && (
        <>
          <Divider />
          <LoginWithDifferentAccount onClick={handleLoginWithDifferent} />
        </>
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

export default BootstrapChallenge;
