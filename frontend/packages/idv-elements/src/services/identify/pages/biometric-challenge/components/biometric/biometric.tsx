import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoFaceid24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { Identifier, LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { Button, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../../../hooks/api/hosted/identify/use-login-challenge';
import Logger from '../../../../../../utils/logger';
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

  const handleComplete = () => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while initiating login biometric challenge',
      );
      Logger.error(
        'No successful identifier found while initiating login biometric challenge',
        'biometric-challenge',
      );
      return;
    }

    if (loginChallengeMutation.isLoading) {
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.biometric,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: payload => {
          handleRequestChallengeSuccess(payload, successfulIdentifier);
        },
        onError: (error: unknown) => {
          console.error(
            'Error while requesting login biometric challenge',
            getErrorMessage(error),
          );
          Logger.error(
            `Error while requesting login biometric challenge: ${getErrorMessage(
              error,
            )}`,
            'biometric-challenge',
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleRequestChallengeSuccess = async (
    payload: LoginChallengeResponse,
    identifier: Identifier,
  ) => {
    const { biometricChallengeJson, challengeToken, challengeKind } =
      payload.challengeData || {};

    if (challengeKind !== ChallengeKind.biometric) {
      console.error(
        'Received sms challenge after requesting login biometric challenge',
      );
      Logger.error(
        'Received sms challenge after requesting login biometric challenge',
        'biometric-challenge',
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
      Logger.error(
        `Unable to generate biometric challenge response ${
          typeof e === 'string' ? e : JSON.stringify(e)
        }`,
        'biometric-challenge',
      );
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
        obConfigAuth,
        sandboxId,
        identifier,
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
        onError: (error: unknown) => {
          console.error(
            'Error while verifying biometric challenge',
            getErrorMessage(error),
          );
          Logger.error(
            `Error while verifying biometric challenge: ${getErrorMessage(
              error,
            )}`,
            'biometric-challenge',
          );
          setIsRetry(true);
        },
        onSettled: () => {
          setIsRunningWebauthn(false);
        },
      },
    );
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
