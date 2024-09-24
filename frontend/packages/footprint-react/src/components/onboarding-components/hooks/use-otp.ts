import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { AuthMethodKind } from '@onefootprint/types';
import { useContext } from 'react';
import { Context } from '../components/provider';
import { createChallenge, createVaultingToken, getValidationToken, verifyChallenge } from '../queries/challenge';
import decryptUserVaultReq from '../queries/decrypt-user-vault';
import getOnboardingStatus from '../queries/get-onboarding-status';
import AuthTokenStatus from '../types/auth-token-status';
import { unlockBody } from '../utils/dom-utils';
import validateAuthToken from '../utils/validate-auth-token';

const useOtp = () => {
  const [context, setContext] = useContext(Context);
  const {
    appearance,
    authToken,
    authTokenStatus,
    challengeData,
    didCallRequiresAuth,
    onboardingConfig,
    publicKey,
    sandboxId,
    sandboxOutcome,
    vaultingToken,
    verifiedAuthToken,
  } = context;

  const authTokenStatusToRequirement = (status: AuthTokenStatus): boolean => {
    if (status === AuthTokenStatus.validWithSufficientScope) {
      return false;
    }
    if (status === AuthTokenStatus.validWithInsufficientScope) {
      return false;
    }
    throw new Error('Invalid auth token. Please use a valid auth token.');
  };

  const requiresAuth = async (): Promise<boolean> => {
    // If we already have a vaulting token, we don't need to authenticate
    if (vaultingToken) {
      setContext(prev => ({ ...prev, didCallRequiresAuth: true }));
      return false;
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
      return false;
    }

    if (authToken) {
      // If we have an auth token, but we don't know if it's valid
      // We need to validate it
      // This part will only be reached if the authTokenStatus is undefined
      // which will only happen once the first time we call the function
      if (!authTokenStatus) {
        const status = await validateAuthToken({
          authToken,
          publicKey,
          sandboxId,
          sandboxOutcome,
          setContext,
        });
        setContext(prev => ({ ...prev, didCallRequiresAuth: true }));
        return authTokenStatusToRequirement(status);
      }
      setContext(prev => ({ ...prev, didCallRequiresAuth: true }));
      return authTokenStatusToRequirement(authTokenStatus);
    }
    setContext(prev => ({ ...prev, didCallRequiresAuth: true }));
    return true;
  };

  const launchIdentify = (
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    {
      onAuthenticated,
      onError,
    }: {
      onAuthenticated?: (response: Awaited<ReturnType<typeof getDataAfterVerify>>) => void;
      onError?: (error: unknown) => void;
    } = {},
  ) => {
    if (authToken && (phoneNumber || email)) {
      onError?.(
        new Error(
          'You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number',
        ),
      );
      return;
    }

    const verifyAuthVariantProps = authToken ? { authToken } : { publicKey };
    const fp = footprint.init({
      ...verifyAuthVariantProps,
      sandboxId,
      sandboxOutcome,
      appearance,
      bootstrapData: {
        'id.phone_number': phoneNumber,
        'id.email': email,
      },
      kind: FootprintComponentKind.Components,
      shouldRelayToComponents: true,
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
      onRelayToComponents: async ({ authToken, vaultingToken }: { vaultingToken: string; authToken: string }) => {
        unlockBody();
        setContext(prev => ({ ...prev, authToken, vaultingToken }));
        const result = await getDataAfterVerify(authToken);
        onAuthenticated?.(result);
      },
    });

    fp.render();
    setContext(prev => ({ ...prev, fpInstance: fp }));
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
    if (!onboardingConfig) {
      throw new Error('Onboarding config not found. Please check your public key');
    }
    const { vaultingToken, authToken } = await verifyChallenge(
      {
        challenge: payload.verificationCode,
        challengeToken: challengeData?.challengeToken,
      },
      {
        token: challengeData.token,
        sandboxOutcome,
      },
    );
    setContext(prev => ({
      ...prev,
      vaultingToken,
      verifiedAuthToken: authToken,
      authTokenStatus: AuthTokenStatus.validWithSufficientScope,
    }));
    return getDataAfterVerify(authToken);
  };

  const getDataAfterVerify = async (authToken: string) => {
    const [{ validationToken }, { requirements, fields }] = await Promise.all([
      getValidationToken({ authToken }),
      getOnboardingStatus({ authToken }),
    ]);
    const vaultData = await decryptUserVaultReq({
      authToken,
      fields: [...fields.collected, ...fields.missing, ...fields.optional],
    });
    setContext(prev => ({ ...prev, vaultData }));
    return { validationToken, requirements, vaultData, fields };
  };

  return {
    launchIdentify,
    createEmailPhoneBasedChallenge,
    createAuthTokenBasedChallenge,
    verify,
    requiresAuth,
  };
};

export default useOtp;
