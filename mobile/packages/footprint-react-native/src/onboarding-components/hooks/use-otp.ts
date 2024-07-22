import { useContext, useState } from 'react';

import { OnboardingStep } from '../../types';
import { Context } from '../components/provider';
import { createChallenge, verifyChallenge } from '../queries/challenge';

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const [challengeData, setChallengeData] = useState<{
    token: string;
    challengeKind: string;
    challengeToken: string;
    biometricChallengeJson: null;
    timeBeforeRetryS: number;
  } | null>(null);

  const create = async (payload: { email?: string; phoneNumber?: string }) => {
    const { onboardingConfig } = context;
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Please make sure that the publicKey is correct');
    }
    const response = await createChallenge(
      payload,
      { onboardingConfig: onboardingConfig.key, sandboxId: context.sandboxId },
    );
    setChallengeData(response.challengeData);
  };

  const verify = async (payload: { challenge: string }) => {
    if (!challengeData) {
      throw new Error('No challengeData found. Please make sure that the publicKey is correct');
    }
    const response = await verifyChallenge(
      {
        challenge: payload.challenge,
        challengeToken: challengeData?.challengeToken,
      },
      {
        token: challengeData.token,
        sandboxOutcome: context.sandboxOutcome,
      },
    );
    setContext(prev => ({
      ...prev,
      authToken: response.authToken,
      vaultingToken: response.authToken,
      step: OnboardingStep.Onboard,
    }));
  };

  return { create, verify };
};

export default useOtp;
