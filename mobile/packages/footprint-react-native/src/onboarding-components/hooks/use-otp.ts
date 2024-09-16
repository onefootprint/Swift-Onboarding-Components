import { useContext } from 'react';

import { OnboardingStep } from '../../types';
import { Context } from '../components/provider';
import { createChallenge, createVaultingToken, verifyChallenge } from '../queries/challenge';
import fp from '../utils/browser';
import { AuthTokenStatus, TenantAuthMethods } from 'src/types/footprint';
import validateAuthToken from '../utils/validate-auth-token';
import { AuthMethodKind } from '@onefootprint/types';

type AuthRequirement = {
  requiresAuth: boolean;
  authMethod: null | TenantAuthMethods;
};

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const isReadyForAuth = !!context.onboardingConfig;
  const { challengeData, didCallRequiresAuth } = context;

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
      setContext(prev => ({ ...prev, didCallRequiresAuth: true }));
      return { requiresAuth: false, authMethod: null };
    }

    // If we have a verified auth token, we don't need to authenticate
    // But we need to create a vaulting token
    if (verifiedAuthToken) {
      const vaultingTokenResponse = await createVaultingToken({ authToken: verifiedAuthToken });
      setContext(prev => ({
        ...prev,
        vaultingToken: vaultingTokenResponse.token,
        didCallRequiresAuth: true,
      }));
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
          sandboxOutcome: context.sandboxOutcome,
          setContext,
        });
        setContext(prev => ({ ...prev, didCallRequiresAuth: true }));

        return authTokenStatusToRequirement(status);
      }
      setContext(prev => ({ ...prev, didCallRequiresAuth: true }));

      return authTokenStatusToRequirement(authTokenStatus);
    }

    setContext(prev => ({ ...prev, didCallRequiresAuth: true }));

    return { requiresAuth: true, authMethod: TenantAuthMethods.emailAndPhone };
  };

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
    if (context.authToken && (phoneNumber || email)) {
      onError?.(
        new Error(
          'You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number',
        ),
      );
      return;
    }
    const { appearance, publicKey, redirectUrl, sandboxId, sandboxOutcome } = context;

    if (!publicKey) {
      onError?.(new Error('No publicKey found. Please make sure to set the publicKey first'));
      return;
    }
    if (!redirectUrl) {
      onError?.(new Error('No redirectUrl found. Please make sure to set the redirectUrl first'));
      return;
    }

    const verifyAuthVariantProps = context.authToken
      ? {
          authToken: context.authToken,
        }
      : {
          publicKey: context.publicKey,
        };

    const component = fp.init({
      ...verifyAuthVariantProps,
      appearance,
      redirectUrl,
      sandboxId,
      sandboxOutcome,
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
      shouldRelayToComponents: true,
    });
    component.render();
  };

  const createEmailPhoneBasedChallenge = async ({ email, phoneNumber }: { email?: string; phoneNumber?: string }) => {
    const { sandboxId, onboardingConfig, authToken } = context;

    if (!onboardingConfig) {
      throw new Error('No onboardingConfig found. Please make sure that the publicKey is correct');
    }
    if (authToken) {
      throw new Error(
        'You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number',
      );
    }
    if (!email && !phoneNumber) {
      throw new Error('Email and/or phone number are required');
    }

    const requiredAuthMethods = onboardingConfig.requiredAuthMethods;

    // If we only have one auth method, we need to make sure that the user has provided the credential for the required method
    if (requiredAuthMethods?.length === 1) {
      if (!email && requiredAuthMethods.includes(AuthMethodKind.email)) {
        throw new Error('Email is required');
      }
      if (!phoneNumber && requiredAuthMethods.includes(AuthMethodKind.phone)) {
        throw new Error('Phone number is required');
      }
    }

    const response = await createChallenge(
      { email, phoneNumber },
      {
        onboardingConfig: onboardingConfig.key,
        sandboxId: sandboxId,
        requiredAuthMethods,
      },
    );
    setContext(prev => ({ ...prev, challengeData: response.challengeData }));
    return response.challengeData.challengeKind;
  };

  const createAuthTokenBasedChallenge = async () => {
    const { sandboxId, onboardingConfig, authToken, authTokenStatus } = context;

    if (!didCallRequiresAuth) {
      throw new Error('Please call "requiresAuth" to check the available auth methods before creating a challenge');
    }
    if (!onboardingConfig) {
      throw new Error('Onboarding config not found. Please check your public key');
    }
    if (!authToken) {
      throw new Error('Auth token not found. Please authenticate using email/phone number');
    }
    if (authTokenStatus === AuthTokenStatus.invalid) {
      throw new Error('Auth token is invalid. Please use a valid auth token');
    }

    const requiredAuthMethods = onboardingConfig.requiredAuthMethods;
    const response = await createChallenge(
      { authToken },
      {
        onboardingConfig: onboardingConfig.key,
        sandboxId: sandboxId,
        requiredAuthMethods,
      },
    );
    setContext(prev => ({ ...prev, challengeData: response.challengeData }));
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
      vaultingToken: response.vaultingToken,
      verifiedAuthToken: response.authToken,
      authTokenStatus: AuthTokenStatus.validWithSufficientScope,
    }));
  };

  return {
    launchIdentify,
    createEmailPhoneBasedChallenge,
    createAuthTokenBasedChallenge,
    verify,
    requiresAuth,
    isReadyForAuth,
  };
};

export default useOtp;
