import { ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import { getCanChallengeBiometrics } from '../../utils/biometrics';
import LoginBiometricChallenge from './components/biometric';
import LoginChallengeSegmentedControl from './components/challenge-picker';
import LoginSmsChallenge from './components/sms';

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
