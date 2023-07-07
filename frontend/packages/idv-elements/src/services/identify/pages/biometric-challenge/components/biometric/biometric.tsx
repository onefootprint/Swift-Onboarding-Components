import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoFaceid24 } from '@onefootprint/icons';
import { ChallengeKind, LoginChallengeResponse } from '@onefootprint/types';
import { Button, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../../../hooks/api/hosted/identify/use-login-challenge';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import { getBiometricChallengeResponse } from '../../../../utils/biometrics';

const Biometric = () => {
  const { t } = useTranslation('pages.biometric-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, sandboxId },
    obConfigAuth,
  } = state.context;
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();

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
          send({
            type: 'challengeSucceeded',
            payload: {
              authToken,
            },
          });
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

  if (isWaiting) {
    return (
      <Typography variant="label-3" color="secondary" sx={{ marginBottom: 6 }}>
        {t('loading')}
      </Typography>
    );
  }

  return (
    <Button
      fullWidth
      onClick={handleComplete}
      loading={isLoading}
      prefixIcon={IcoFaceid24}
    >
      {isRetry ? t('cta-retry') : t('cta')}
    </Button>
  );
};

export default Biometric;
