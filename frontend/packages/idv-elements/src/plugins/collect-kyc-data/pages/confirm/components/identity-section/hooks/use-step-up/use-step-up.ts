import { getErrorMessage } from '@onefootprint/request';
import { ChallengeKind, UserTokenScope } from '@onefootprint/types';
import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useUserToken } from '../../../../../../../../hooks/api';
import type { DeviceInfo } from '../../../../../../../../hooks/ui/use-device-info';
import useIdentify from './hooks/use-identify';
import type { IdentifyVerifyResponse } from './hooks/use-identify-verify';
import useIdentifyVerify from './hooks/use-identify-verify';
import type { LoginChallengeResponse } from './hooks/use-login-challenge';
import useLoginChallenge from './hooks/use-login-challenge';
import getBiometricChallengeResponse from './utils/get-biometric-challenge-response';

type UseStepUpArgs = {
  authToken: string;
  device: DeviceInfo;
  onSuccess?: (authToken: string) => void;
  onError?: (error: unknown) => void;
};
const useStepUp = ({
  authToken,
  device,
  onSuccess,
  onError,
}: UseStepUpArgs) => {
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);

  const userTokenQuery = useUserToken(
    { authToken },
    {
      onError: (error: unknown) => {
        onError?.(
          `Failed to get user token info for step up. ${getErrorMessage(
            error,
          )}`,
        );
      },
    },
  );
  const identifyMutation = useIdentify();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const isLoading =
    isRunningWebauthn ||
    userTokenQuery.isLoading ||
    identifyMutation.isLoading ||
    loginChallengeMutation.isLoading ||
    identifyVerifyMutation.isLoading;

  useEffectOnce(() => {
    identifyMutation.mutate(
      { authToken },
      {
        onError: (error: unknown) => {
          onError?.(
            `Failed to identify user for step up, ${getErrorMessage(error)}`,
          );
        },
      },
    );
  });

  const needsStepUp = !userTokenQuery.data?.scopes.includes(
    UserTokenScope.sensitiveProfile,
  );
  const canRequestBiometric =
    device.hasSupportForWebauthn &&
    identifyMutation.data?.availableChallengeKinds?.includes(
      ChallengeKind.biometric,
    );

  let hasDeviceSupport = device.hasSupportForWebauthn;
  if (device.type === 'desktop') {
    hasDeviceSupport =
      hasDeviceSupport && !!identifyMutation.data?.hasSyncablePassKey;
  }

  const canStepUp = canRequestBiometric && hasDeviceSupport;

  const handleLoginChallengeSuccess = async (
    payload: LoginChallengeResponse,
  ) => {
    if (!payload?.challengeData) {
      onError?.(
        `Missing challenge data in response. Challenge kind received: ${payload.challengeData.challengeKind}`,
      );
      return;
    }
    const { biometricChallengeJson, challengeToken, challengeKind } =
      payload.challengeData;

    if (challengeKind !== ChallengeKind.biometric) {
      onError?.(
        `Received ${challengeKind} challenge after requesting login biometric challenge`,
      );
      return;
    }

    if (!biometricChallengeJson || !challengeToken) {
      onError?.('Missing challenge data in response.');
      return;
    }

    setIsRunningWebauthn(true);
    let challengeResponse;
    try {
      challengeResponse = await getBiometricChallengeResponse(
        biometricChallengeJson,
      );
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
        authToken,
      },
      {
        onSuccess: ({
          authToken: steppedUpAuthToken,
        }: IdentifyVerifyResponse) => {
          onSuccess?.(steppedUpAuthToken);
        },
        onError: (error: unknown) => {
          onError?.(
            `Encountered error while verifying login challenge for step up: ${getErrorMessage(
              error,
            )}`,
          );
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
      },
      {
        onSuccess: handleLoginChallengeSuccess,
        onError: (error: unknown) => {
          onError?.(
            `Encountered error while requesting login challenge for step up: ${getErrorMessage(
              error,
            )}`,
          );
        },
      },
    );
  };

  return { needsStepUp, canStepUp, stepUp, isLoading };
};

export default useStepUp;
