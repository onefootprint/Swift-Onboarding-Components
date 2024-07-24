import { getErrorMessage } from '@onefootprint/request';
import type {
  IdentifyResponse,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
  UserTokenResponse,
} from '@onefootprint/types';
import { ChallengeKind, IdentifyTokenScope, UserTokenScope } from '@onefootprint/types';
import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useIdentify, useIdentifyVerify, useLoginChallenge } from '../../../../../../../../components/identify/queries';
import type { DeviceInfo } from '../../../../../../../../hooks/ui/use-device-info';
import { useUserToken } from '../../../../../../../../queries';
import getBiometricChallengeResponse from './utils/get-biometric-challenge-response';

type UseStepUpArgs = {
  authToken: string;
  device: DeviceInfo;
  onSuccess?: (authToken: string) => void;
  onError?: (error: unknown) => void;
};

const isStepUpPossible = (
  { type, hasSupportForWebauthn }: DeviceInfo,
  response: IdentifyResponse | undefined,
): boolean => {
  const serverSide = response?.user?.availableChallengeKinds.includes(ChallengeKind.biometric);
  const clientSide = hasSupportForWebauthn && type === 'desktop' ? response?.user?.hasSyncablePasskey : true;

  return Boolean(serverSide) && Boolean(clientSide);
};

const isStepUpNeeded = (data?: Pick<UserTokenResponse, 'scopes'>) =>
  !data?.scopes.includes(UserTokenScope.sensitiveProfile);

const useStepUp = ({ authToken, device, onSuccess, onError }: UseStepUpArgs) => {
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);

  const userTokenQuery = useUserToken(
    { authToken },
    {
      onError: (error: unknown) => {
        onError?.(`Failed to get user token info for step up. ${getErrorMessage(error)}`);
      },
    },
  );
  const scope = IdentifyTokenScope.onboarding;
  const identifyMutation = useIdentify({ scope });
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify({ scope });
  const isLoading =
    isRunningWebauthn ||
    userTokenQuery.isLoading ||
    identifyMutation.isLoading ||
    loginChallengeMutation.isLoading ||
    identifyVerifyMutation.isLoading;

  const needsStepUp = isStepUpNeeded(userTokenQuery.data);
  const canStepUp = isStepUpPossible(device, identifyMutation.data);

  useEffectOnce(() => {
    identifyMutation.mutate(
      { authToken },
      {
        onError: (error: unknown) => {
          onError?.(`Failed to identify user for step up, ${getErrorMessage(error)}`);
        },
      },
    );
  });

  const handleLoginChallengeSuccess = async (payload: LoginChallengeResponse) => {
    if (!payload?.challengeData) {
      onError?.(`Missing challenge data in response. Challenge kind received: ${payload.challengeData.challengeKind}`);
      return;
    }
    const { biometricChallengeJson, challengeToken, challengeKind } = payload.challengeData;

    if (challengeKind !== ChallengeKind.biometric) {
      onError?.(`Received ${challengeKind} challenge after requesting login biometric challenge`);
      return;
    }

    if (!biometricChallengeJson || !challengeToken) {
      onError?.('Missing challenge data in response.');
      return;
    }

    setIsRunningWebauthn(true);
    let challengeResponse;
    try {
      challengeResponse = await getBiometricChallengeResponse(biometricChallengeJson);
    } catch (e) {
      onError?.(`Failed to get biometric challenge response, ${e}`);
    }

    if (!challengeResponse) {
      setIsRunningWebauthn(false);
      return;
    }

    if (identifyVerifyMutation.isLoading) {
      return;
    }

    identifyVerifyMutation.mutate(
      {
        challengeResponse,
        challengeToken,
        authToken: payload.challengeData.token,
      },
      {
        onSuccess: ({ authToken: steppedUpAuthToken }: IdentifyVerifyResponse) => {
          onSuccess?.(steppedUpAuthToken);
        },
        onError: (error: unknown) => {
          onError?.(`Encountered error while verifying login challenge for step up: ${getErrorMessage(error)}`);
        },
        onSettled: () => {
          setIsRunningWebauthn(false);
        },
      },
    );
  };

  const stepUp = async () => {
    if (!needsStepUp) {
      onSuccess?.(authToken);
      return;
    }

    if (!canStepUp) {
      onError?.(
        `Cannot execute step up on current device. ${device.type} device kind, has support for webauthn: ${device.hasSupportForWebauthn}`,
      );
      return;
    }

    if (loginChallengeMutation.isLoading) {
      return;
    }

    loginChallengeMutation.mutate(
      {
        authToken,
        preferredChallengeKind: ChallengeKind.biometric,
      },
      {
        onSuccess: handleLoginChallengeSuccess,
        onError: (error: unknown) => {
          onError?.(`Encountered error while requesting login challenge for step up: ${getErrorMessage(error)}`);
        },
      },
    );
  };

  return { needsStepUp, canStepUp, stepUp, isLoading };
};

export default useStepUp;
