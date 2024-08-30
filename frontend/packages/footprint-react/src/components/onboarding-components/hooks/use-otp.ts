import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import type { ChallengeData } from '@onefootprint/types';
import { useContext, useState } from 'react';
import { Context } from '../provider';
import { createChallenge, createVaultingToken, verifyChallenge } from '../queries/challenge';
import AuthTokenStatus from '../types/auth-token-status';
import TenantAuthMethods from '../types/tenant-auth-methods';
import { unlockBody } from '../utils/dom-utils';
import validateAuthToken from '../utils/validate-auth-token';

type AuthRequirement = {
  requiresAuth: boolean;
  authMethod: null | TenantAuthMethods;
};

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);

  const authTokenStatusToRequirement = (status: AuthTokenStatus): AuthRequirement => {
    if (status === AuthTokenStatus.validWithSufficientScope) {
      return { requiresAuth: false, authMethod: null };
    }
    if (status === AuthTokenStatus.validWithInsufficientScope) {
      return { requiresAuth: true, authMethod: TenantAuthMethods.authToken };
    }
    throw new Error('Invalid auth token. Please use a valid auth token.');
  };

  const requiresAuth = async (): Promise<AuthRequirement> => {
    const { authToken, authTokenStatus, vaultingToken, verifiedAuthToken } = context;

    // If we already have a vaulting token, we don't need to authenticate
    if (vaultingToken) {
      return { requiresAuth: false, authMethod: null };
    }

    // If we have a verified auth token, we don't need to authenticate
    // But we need to create a vaulting token
    if (verifiedAuthToken) {
      const vaultingTokenResponse = await createVaultingToken({ authToken: verifiedAuthToken });
      setContext(prev => ({ ...prev, vaultingToken: vaultingTokenResponse.token }));
      return { requiresAuth: false, authMethod: null };
    }

    if (authToken) {
      // If we have an auth token, but we don't know if it's valid
      // We need to validate it
      // This part will only be reached if the authTokenStatus is undefined
      // which will only happen once the first time we call the function
      if (!authTokenStatus) {
        const status = await validateAuthToken({
          publicKey: context.publicKey,
          authToken,
          sandboxId: context.sandboxId,
          setContext,
        });
        return authTokenStatusToRequirement(status);
      }
      return authTokenStatusToRequirement(authTokenStatus);
    }

    return { requiresAuth: true, authMethod: TenantAuthMethods.emailAndPhone };
  };

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

  const verify = async (payload: { verificationCode: string }) => {
    if (!challengeData) {
      throw new Error('No challengeData found. Please make sure that the publicKey is correct');
    }
    const response = await verifyChallenge(
      {
        challenge: payload.verificationCode,
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
      vaultingToken: response.vaultingToken,
    }));
  };

  return { launchIdentify, create, verify, requiresAuth };
};

export default useOtp;
