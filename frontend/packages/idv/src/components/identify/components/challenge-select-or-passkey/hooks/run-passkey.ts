import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getBiometricChallengeResponse, Logger } from '../../../../../utils';
import { useIdentifyVerify, useLoginChallenge } from '../../../queries';
import { useIdentifyMachine } from '../../../state';
import getTokenScope from '../../../utils/token-scope';

type UseRunPasskeyArgs = {
  onSuccess: (_: { authToken: string }) => void;
};

const useRunPasskey = ({ onSuccess }: UseRunPasskeyArgs) => {
  const [state] = useIdentifyMachine();
  const {
    identify: { user },
    variant,
  } = state.context;
  const { t } = useTranslation('identify', {
    keyPrefix: 'passkey-challenge',
  });
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const mutLoginChallenge = useLoginChallenge();
  const mutIdentifyVerify = useIdentifyVerify({
    scope: getTokenScope(variant),
  });

  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isWaiting = isRunningWebauthn || mutIdentifyVerify.isLoading;

  const initiatePasskeyChallenge = () => {
    if (!user?.token) {
      Logger.error(
        'No identifying token found while initiating login biometric challenge',
        { location: 'run-passkey' },
      );
      return;
    }

    if (mutLoginChallenge.isLoading) {
      return;
    }

    mutLoginChallenge.mutate(
      {
        authToken: user?.token,
        preferredChallengeKind: ChallengeKind.biometric,
      },
      {
        onError: error => {
          Logger.warn(
            `Error while requesting login biometric challenge: ${getErrorMessage(
              error,
            )}`,
            { location: 'run-passkey' },
          );
          showRequestErrorToast(error);
        },
        onSuccess: handleRequestChallengeSuccess,
      },
    );
  };

  const handleRequestChallengeSuccess = async (
    payload: LoginChallengeResponse,
  ) => {
    const { token, biometricChallengeJson, challengeToken, challengeKind } =
      payload.challengeData || {};

    if (challengeKind !== ChallengeKind.biometric) {
      Logger.error(
        'Received sms challenge after requesting login biometric challenge',
        { location: 'run-passkey' },
      );
      return;
    }
    if (!biometricChallengeJson || !challengeToken) {
      return;
    }

    setIsRunningWebauthn(true);
    let challengeResponse;
    try {
      challengeResponse = await getBiometricChallengeResponse(
        biometricChallengeJson,
      );
    } catch (e) {
      Logger.warn(
        `Unable to generate biometric challenge response ${
          typeof e === 'string' ? e : JSON.stringify(e)
        }`,
        { location: 'run-passkey' },
      );
      toast.show({
        title: t('error.title'),
        description: t('error.description'),
        variant: 'error',
      });
    }

    if (!challengeResponse) {
      setIsRunningWebauthn(false);
      return;
    }

    if (mutIdentifyVerify.isLoading) {
      return;
    }

    mutIdentifyVerify.mutate(
      {
        authToken: token,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess,
        onError: (error: unknown) => {
          Logger.warn(
            `Error while verifying biometric challenge: ${getErrorMessage(
              error,
            )}`,
            { location: 'run-passkey' },
          );
        },
        onSettled: () => {
          setIsRunningWebauthn(false);
        },
      },
    );
  };

  return {
    isWaiting,
    initiatePasskeyChallenge,
  };
};

export default useRunPasskey;
