import { ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';
import useIdentifyMachine from 'src/hooks/use-identify-machine';
import LoginBiometricChallenge from 'src/pages/identify/components/login-challenge/components/login-biometric-challenge';
import LoginSmsChallenge from 'src/pages/identify/components/login-challenge/components/login-sms-challenge';
import LoginChallengeSegmentedControl from 'src/pages/identify/components/login-challenge-segmented-control';
import getCanChallengeBiometrics from 'src/pages/identify/utils/get-can-challenge-biometrics';
import styled, { css } from 'styled-components';

const LoginChallenge = () => {
  const [state] = useIdentifyMachine();
  const { device, challenge } = state.context;
  const [selectedChallengeKind, setSelectedChallengeKind] =
    useState<ChallengeKind>(ChallengeKind.sms);
  const canChallengeBiometrics = getCanChallengeBiometrics(device, challenge);

  if (!canChallengeBiometrics) {
    return <LoginSmsChallenge />;
  }

  const handleChangeChallengeKind = (challengeKind: ChallengeKind) => {
    setSelectedChallengeKind(challengeKind);
  };

  return (
    <>
      {canChallengeBiometrics && (
        <LoginChallengeSegmentedControl onChange={handleChangeChallengeKind} />
      )}
      <ChallengeContainer visible={selectedChallengeKind === ChallengeKind.sms}>
        <LoginSmsChallenge />
      </ChallengeContainer>
      <ChallengeContainer
        visible={selectedChallengeKind === ChallengeKind.biometric}
      >
        <LoginBiometricChallenge />
      </ChallengeContainer>
    </>
  );
};

const ChallengeContainer = styled.div<{ visible: boolean }>`
  ${({ visible }) => css`
    display: ${visible ? 'flex' : 'none'};
    width: 100%;
    justify-content: center;
    align-items: center;
  `}
`;

export default LoginChallenge;
