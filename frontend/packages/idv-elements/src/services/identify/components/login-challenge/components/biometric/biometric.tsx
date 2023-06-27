import { useRequestErrorToast } from '@onefootprint/hooks';
import { ChallengeKind, LoginChallengeResponse } from '@onefootprint/types';
import React, { useState } from 'react';

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../../../hooks/api/hosted/identify/use-login-challenge';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import { getBiometricChallengeResponse } from '../../../../utils/biometrics';
import Verification from './components/verification';

const SUCCESS_EVENT_DELAY_MS = 1500;

const Biometric = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, sandboxId },
    obConfigAuth,
  } = state.context;
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();

  const [isSuccess, setSuccess] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isWaiting = isRunningWebauthn || identifyVerifyMutation.isLoading;
  const { isLoading } = loginChallengeMutation;

  const handleComplete = async () => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while initiating login biometric challenge',
      );
      return;
    }

    loginChallengeMutation
      .mutateAsync(
        {
          identifier: successfulIdentifier,
          preferredChallengeKind: ChallengeKind.biometric,
          obConfigAuth,
          sandboxId,
        },
        {
          onSuccess: handleRequestChallengeSuccess,
          onError: handleRequestError,
        },
      )
      .catch((error: unknown) => {
        handleRequestError(error);
      });
  };

  const handleRequestChallengeSuccess = async (
    payload: LoginChallengeResponse,
  ) => {
    const { biometricChallengeJson, challengeToken, challengeKind } =
      payload.challengeData || {};

    if (challengeKind !== ChallengeKind.biometric) {
      console.error(
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
      console.error(e);
    }

    if (!challengeResponse) {
      setIsRunningWebauthn(false);
      return;
    }

    identifyVerifyMutation.mutate(
      {
        challengeResponse,
        challengeToken,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: ({ authToken }) => {
          setSuccess(true);
          setTimeout(() => {
            send({
              type: 'challengeSucceeded',
              payload: {
                authToken,
              },
            });
          }, SUCCESS_EVENT_DELAY_MS);
        },
        onError: () => {
          setIsRetry(true);
        },
        onSettled: () => {
          setIsRunningWebauthn(false);
        },
      },
    );
  };

  const handleRequestError = (error: unknown) => {
    showRequestErrorToast(error);
    console.error(error);
  };

  return (
    <Verification
      isWaiting={isWaiting}
      isSuccess={isSuccess}
      isRetry={isRetry}
      onComplete={handleComplete}
      isLoading={isLoading}
    />
  );
};

export default Biometric;
