import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import type { ChallengeData } from '@onefootprint/types';
import { useContext, useState } from 'react';
import { Context } from '../provider';
import { createChallenge } from '../queries/challenge';
import { unlockBody } from '../utils/dom-utils';

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const [_challengeData, setChallengeData] = useState<ChallengeData | null>(null);

  const launchIdentify = (
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    {
      onAuthenticated,
      onError,
    }: {
      onAuthenticated?: () => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    // TODO: we need to pass sandbox id from context here too. We will need to wait until the BE is ready
    const fp = footprint.init({
      appearance: context.appearance,
      publicKey: context.publicKey,
      sandboxOutcome: context.sandboxOutcome,
      bootstrapData: {
        'id.phone_number': phoneNumber,
        'id.email': email,
      },
      kind: FootprintComponentKind.Components,
      onComplete: (validationToken: string) => {
        setContext(prev => {
          prev.handoffCallbacks?.onComplete?.(validationToken);
          return prev;
        });
      },
      onError: (error: unknown) => {
        onError?.(error);
        setContext(prev => {
          prev.handoffCallbacks?.onError?.(error);
          return prev;
        });
      },
      onCancel: () => {
        setContext(prev => {
          prev.handoffCallbacks?.onCancel?.();
          return prev;
        });
      },
      onClose: () => {
        setContext(prev => {
          prev.handoffCallbacks?.onClose?.();
          return prev;
        });
      },
      onRelayToComponents: (authToken: string) => {
        unlockBody();
        // This part might be a little confusing, but we need to set the vaultingToken here
        // Technically, the the authToken we recieve here has a lower scope and can only be used for vaulting
        // The token is created by a API request to "/hosted/user/tokens" using the original authToken
        setContext(prev => ({ ...prev, vaultingToken: authToken }));
        onAuthenticated?.();
      },
    });

    fp.render();
    setContext(prev => ({ ...prev, fpInstance: fp }));
  };

  const create = async (payload: { email?: string; phoneNumber?: string }) => {
    if (!payload.email || !payload.phoneNumber) {
      // TODO: In the future, we should allow email-only
      throw new Error('Email and phone number are required');
    }
    const { onboardingConfig } = context;
    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Please make sure that the publicKey is correct');
    }
    const requiredAuthMethods = onboardingConfig.requiredAuthMethods;
    const response = await createChallenge(payload, {
      onboardingConfig: onboardingConfig.key,
      sandboxId: context.sandboxId,
      requiredAuthMethods,
    });
    setChallengeData(response.challengeData);
    return response.challengeData.challengeKind;
  };

  return { launchIdentify, create };
};

export default useOtp;
