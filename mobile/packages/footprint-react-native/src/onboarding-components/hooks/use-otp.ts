import { useContext, useState } from 'react';

import { OnboardingStep } from '../../types';
import { Context } from '../components/provider';
import { createChallenge, verifyChallenge } from '../queries/challenge';
import fp from '../utils/browser';

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const [challengeData, setChallengeData] = useState<{
    token: string;
    challengeKind: string;
    challengeToken: string;
    biometricChallengeJson: null;
    timeBeforeRetryS: number;
  } | null>(null);

  const launchIdentify = (
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    {
      onAuthenticated,
      onError,
      onCancel,
    }: {
      onAuthenticated?: () => void;
      onError?: (error: unknown) => void;
      onCancel?: () => void;
    } = {},
  ) => {
    const { appearance, publicKey, redirectUrl } = context;

    if (!publicKey) {
      throw new Error('No publicKey found. Please make sure to set the publicKey first');
    }
    if (!redirectUrl) {
      throw new Error('No redirectUrl found. Please make sure to set the redirectUrl first');
    }

    const component = fp.init({
      appearance,
      publicKey,
      redirectUrl,
      bootstrapData: {
        'id.phone_number': phoneNumber,
        'id.email': email,
      },
      onAuthComplete: ({
        authToken,
        vaultingToken,
      }: {
        authToken: string;
        vaultingToken: string;
      }) => {
        setContext(prev => ({
          ...prev,
          authToken,
          vaultingToken,
          step: OnboardingStep.Onboard,
        }));
        onAuthenticated?.();
      },
      onError: (error: unknown) => {
        onError?.(error);
      },
      onCancel: () => {
        onCancel?.();
      },
      step: OnboardingStep.Auth,
    });
    component.render();
  };

  const create = async (payload: { email?: string; phoneNumber?: string }) => {
    const { onboardingConfig } = context;
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Please make sure that the publicKey is correct');
    }
    const response = await createChallenge(payload, {
      onboardingConfig: onboardingConfig.key,
      sandboxId: context.sandboxId,
    });
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

  return { create, verify, launchIdentify };
};

export default useOtp;
