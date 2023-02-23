import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { DeviceInfo, useTranslation } from '@onefootprint/hooks';
import { ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';
import { MachineChallengeContext } from 'src/utils/state-machine/identify';
import styled, { css } from 'styled-components';

import LegalFooter from '../../components/legal-footer';
import useIdentifyMachine, { Events } from '../../hooks/use-identify-machine';
import BiometricChallenge from './components/biometric-challenge';
import LoginChallengeSegmentedControl from './components/login-challenge-segmented-control';
import LoginWithDifferentAccount from './components/login-with-different-account';
import SmsChallenge from './components/sms-challenge';

const getCanChallengeBiometrics = (
  device: DeviceInfo,
  challengeContext: MachineChallengeContext,
) => {
  const hasAvailableBiometricChallenge =
    challengeContext.availableChallengeKinds?.includes(ChallengeKind.biometric);
  if (!hasAvailableBiometricChallenge) {
    return false;
  }
  if (device.type === 'mobile') {
    return device.hasSupportForWebauthn;
  }
  return device.hasSupportForWebauthn && challengeContext.hasSyncablePassKey;
};

const BootstrapChallenge = () => {
  const { t } = useTranslation('pages.bootstrap-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    device,
    bootstrapData,
    challenge,
    identify: { successfulIdentifier },
    config,
  } = state.context;

  const [selectedChallengeKind, setSelectedChallengeKind] =
    useState<ChallengeKind>(ChallengeKind.sms);
  const handleChangeChallengeKind = (challengeKind: ChallengeKind) => {
    setSelectedChallengeKind(challengeKind);
  };

  // TODO: add logic for showing the transfer QR code
  const showToggle = getCanChallengeBiometrics(device, challenge);
  const showMissingPhoneLabel =
    successfulIdentifier && 'email' in successfulIdentifier;

  const handleLoginWithDifferent = () => {
    send({
      type: Events.identifyReset,
    });
  };

  return (
    <Container>
      <NavigationHeader button={{ variant: 'close' }} />
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle', { tenantName: config?.orgName })}
      />
      {showToggle && (
        <LoginChallengeSegmentedControl onChange={handleChangeChallengeKind} />
      )}
      <ChallengeContainer visible={selectedChallengeKind === ChallengeKind.sms}>
        <SmsChallenge />
      </ChallengeContainer>
      <ChallengeContainer
        visible={selectedChallengeKind === ChallengeKind.biometric}
      >
        <BiometricChallenge />
      </ChallengeContainer>
      <LegalFooter />
      {bootstrapData && (
        <LoginWithDifferentAccount
          showMissingPhoneLabel={showMissingPhoneLabel}
          onClick={handleLoginWithDifferent}
        />
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

const ChallengeContainer = styled.div<{ visible: boolean }>`
  ${({ visible }) => css`
    display: ${visible ? 'flex' : 'none'};
    width: 100%;
    justify-content: center;
    align-items: center;
  `}
`;

export default BootstrapChallenge;
