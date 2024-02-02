import { IcoFaceid24 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { Identifier, LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { Button, Typography, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useIdentifyVerify from '../../../../../../hooks/api/hosted/identify/use-identify-verify';
import useLoginChallenge from '../../../../../../hooks/api/hosted/identify/use-login-challenge';
import useIdvRequestErrorToast from '../../../../../../hooks/ui/use-idv-request-error-toast';
import getBiometricChallengeResponse from '../../../../../../utils/get-biometric-challenge-response';
import Logger from '../../../../../../utils/logger';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const Biometric = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.pages.biometric-challenge',
  });
  const [state, send] = useIdentifyMachine();
  const {
    identify: { successfulIdentifier, sandboxId },
    obConfigAuth,
  } = state.context;
  const showRequestErrorToast = useIdvRequestErrorToast();
  const toast = useToast();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isWaiting = isRunningWebauthn || identifyVerifyMutation.isLoading;
  const { isLoading } = loginChallengeMutation;

  const handleComplete = () => {
    if (!successfulIdentifier) {
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
      Logger.error(
        `Unable to generate biometric challenge response ${
          typeof e === 'string' ? e : JSON.stringify(e)
        }`,
        'biometric-challenge',
      );
      toast.show({
        title: t('passkey-error.title'),
        description: t('passkey-error.description'),
        variant: 'error',
      });
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
          Logger.error(
            `Error while verifying biometric challenge: ${getErrorMessage(
              error,
            )}`,
            'biometric-challenge',
          );
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
      {t('cta')}
    </Button>
  );
};

export default Biometric;
