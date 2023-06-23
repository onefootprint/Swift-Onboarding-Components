import styled from '@onefootprint/styled';
import { ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import { getCanChallengeBiometrics } from '../../utils/biometrics';
import LoginBiometricChallenge from './components/biometric';
import LoginChallengeSegmentedControl from './components/challenge-picker';
import LoginSmsChallenge from './components/sms';

const LoginChallenge = () => {
  const [state] = useIdentifyMachine();
  const { device, challenge } = state.context;
  const [selectedChallengeKind, setSelectedChallengeKind] =
    useState<ChallengeKind>(ChallengeKind.biometric);
  const canChallengeBiometrics = getCanChallengeBiometrics(challenge, device);

  if (!canChallengeBiometrics) {
    return <LoginSmsChallenge />;
  }

  const handleChangeChallengeKind = (challengeKind: ChallengeKind) => {
    setSelectedChallengeKind(challengeKind);
  };

  return (
    <>
      <LoginChallengeSegmentedControl onChange={handleChangeChallengeKind} />
      <ChallengeContainer>
        {selectedChallengeKind === ChallengeKind.sms ? (
          <LoginSmsChallenge />
        ) : (
          <LoginBiometricChallenge />
        )}
      </ChallengeContainer>
    </>
  );
};

const ChallengeContainer = styled.div`
  display: 'flex';
  width: 100%;
  justify-content: center;
  align-items: center;
`;

export default LoginChallenge;
