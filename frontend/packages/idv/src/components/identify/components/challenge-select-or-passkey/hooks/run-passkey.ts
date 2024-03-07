import { useRequestErrorToast } from '@onefootprint/hooks';
import type { LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getBiometricChallengeResponse, getLogger } from '../../../../../utils';
import { useIdentifyVerify, useLoginChallenge } from '../../../queries';
import { useIdentifyMachine } from '../../../state';
import getTokenScope from '../../../utils/token-scope';

type UseRunPasskeyArgs = {
  onSuccess: (_: { authToken: string }) => void;
};

const { logError } = getLogger('run-passkey');

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
      logError(
        'No identifying token found while initiating login biometric challenge',
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
          logError('Error while requesting login biometric challenge:', error);
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
      logError(
        'Received sms challenge after requesting login biometric challenge',
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
      logError(
        `Unable to generate biometric challenge response ${
          typeof e === 'string' ? e : JSON.stringify(e)
        }`,
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
          logError('Error while verifying biometric challenge:', error);
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
