import {
  useIdentifyVerify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { ChallengeKind, LoginChallengeResponse } from '@onefootprint/types';
import React, { useState } from 'react';
import useIdentifyMachine, { Events } from 'src/hooks/use-identify-machine';
import BiometricChallengeVerification from 'src/pages/identify/components/biometric-challenge-verification';
import generateLoginDeviceResponse from 'src/pages/identify/utils/biometric/login-challenge-response';
import { useEffectOnce } from 'usehooks-ts';

const SUCCESS_EVENT_DELAY_MS = 1500;

const BiometricChallenge = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier },
    challenge: { challengeData },
    config,
  } = state.context;

  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();

  const [isSuccess, setSuccess] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isLoading =
    isRunningWebauthn ||
    loginChallengeMutation.isLoading ||
    identifyVerifyMutation.isLoading;

  const handleComplete = async () => {
    const { biometricChallengeJson, challengeToken } = challengeData || {};
    if (!biometricChallengeJson || !challengeToken) {
      return;
    }

    setIsRunningWebauthn(true);
    let challengeResponse;
    try {
      challengeResponse = await generateLoginDeviceResponse(
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
      { challengeResponse, challengeToken, tenantPk: config?.key },
      {
        onSuccess: ({ authToken }) => {
          setSuccess(true);
          setTimeout(() => {
            send({
              type: Events.challengeSucceeded,
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

  const handleRequestChallengeSuccess = (payload: LoginChallengeResponse) => {
    if (payload.challengeData.challengeKind !== ChallengeKind.biometric) {
      console.error(
        'Received sms challenge after requesting bootstrap biometric challenge',
      );
      return;
    }
    send({
      type: Events.challengeInitiated,
      payload: {
        challengeData: payload.challengeData,
      },
    });
  };

  const handleRequestError = (error: unknown) => {
    showRequestErrorToast(error);
    console.error(error);
  };

  useEffectOnce(() => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while initiating bootstrap biometric challenge',
      );
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.biometric,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: handleRequestError,
      },
    );
  });

  return (
    <BiometricChallengeVerification
      isLoading={isLoading}
      isSuccess={isSuccess}
      isRetry={isRetry}
      onComplete={handleComplete}
    />
  );
};

export default BiometricChallenge;
