import { useRequestErrorToast } from '@onefootprint/hooks';
import { getBiometricChallengeResponse, getLogger } from '@onefootprint/idv';
import type { LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentifyVerify, useLoginChallenge } from '../../../queries';
import { useIdentifyMachine } from '../../../state';

type UseRunPasskeyArgs = {
  onSuccess: (_: { authToken: string }) => void;
};

const { logError } = getLogger('run-passkey');

const useRunPasskey = ({ onSuccess }: UseRunPasskeyArgs) => {
  const [state] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, sandboxId },
    obConfigAuth,
    initialAuthToken,
  } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'passkey-challenge',
  });
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const commonMutationProps = {
    authToken: initialAuthToken,
    obConfigAuth,
    sandboxId,
  };
  const mutLoginChallenge = useLoginChallenge(commonMutationProps);
  const mutIdentifyVerify = useIdentifyVerify(commonMutationProps);
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isWaiting = isRunningWebauthn || mutIdentifyVerify.isLoading;

  const initiatePasskeyChallenge = () => {
    if (!successfulIdentifier) {
      logError(
        'No successful identifier found while initiating login biometric challenge',
      );
      return;
    }

    if (mutLoginChallenge.isLoading) {
      return;
    }

    // We'll be able to simplify this soon with the token-based login challenges
    const loginIdentifier =
      'email' in successfulIdentifier || 'phoneNumber' in successfulIdentifier
        ? successfulIdentifier
        : undefined;
    mutLoginChallenge.mutate(
      {
        identifier: loginIdentifier,
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
    const { biometricChallengeJson, challengeToken, challengeKind } =
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
