import type { SandboxOutcome } from '@onefootprint/footprint-js';
import type { UpdateContext } from '../components/provider';
import { createVaultingToken, getValidationToken, identify, initOnboarding } from '../queries/challenge';
import AuthTokenStatus from '../types/auth-token-status';

type ValidateAuthTokenProps = {
  publicKey: string;
  authToken: string;
  sandboxId?: string;
  setContext: UpdateContext;
  sandboxOutcome?: SandboxOutcome;
};

const validateAuthToken = async ({
  publicKey,
  authToken,
  sandboxId,
  setContext,
  sandboxOutcome,
}: ValidateAuthTokenProps): Promise<AuthTokenStatus> => {
  try {
    const identifyResponse = await identify(
      { authToken },
      {
        sandboxId,
        onboardingConfig: publicKey,
      },
    );
    const tokenScopes = identifyResponse.user?.tokenScopes;

    // TODO: technically we should check if the token scopes has the required scope
    // but that check only matters for auth method update case
    // This is the required scope mapping in bifrost
    //  [IdentifyVariant.auth]: [],
    //  [IdentifyVariant.updateLoginMethods]: [UserTokenScope.explicitAuth],
    //  [IdentifyVariant.verify]: [],
    // So since we are only doing "verify" in our SDK, we don't need to check for the required scope
    // We just check if the tokenScopes is not empty
    // Relevant code in FE: frontend/packages/idv/src/components/identify/components/init-auth-token/init-auth-token.tsx
    if (tokenScopes?.length) {
      await getValidationToken({ token: authToken });
      await initOnboarding({ token: authToken, sandboxOutcome });
      const vaultingTokenResponse = await createVaultingToken({
        authToken,
      });
      setContext(prev => ({
        ...prev,
        verifiedAuthToken: authToken,
        authTokenStatus: AuthTokenStatus.validWithSufficientScope,
        vaultingToken: vaultingTokenResponse.token,
      }));
      return AuthTokenStatus.validWithSufficientScope;
    }
    setContext(prev => ({
      ...prev,
      authTokenStatus: AuthTokenStatus.validWithInsufficientScope,
    }));
    return AuthTokenStatus.validWithInsufficientScope;
  } catch (_) {
    setContext(prev => ({
      ...prev,
      authTokenStatus: AuthTokenStatus.invalid,
    }));
    throw new Error('Error identifying authToken. Please check your token');
  }
};

export default validateAuthToken;
