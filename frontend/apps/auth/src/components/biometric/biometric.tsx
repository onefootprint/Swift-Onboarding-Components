import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoFaceid24 } from '@onefootprint/icons';
import { getBiometricChallengeResponse } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { Button, Typography, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentifyVerify, useLoginChallenge } from '@/src/queries';
import { useAuthMachine } from '@/src/state';

const Biometric = () => {
  const [state, send] = useAuthMachine();
  const {
    identify: { successfulIdentifier, sandboxId },
    obConfigAuth,
  } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'passkey-challenge',
  });
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const mutLoginChallenge = useLoginChallenge({ obConfigAuth, sandboxId });
  const mutIdentifyVerify = useIdentifyVerify({ obConfigAuth, sandboxId });
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isWaiting = isRunningWebauthn || mutIdentifyVerify.isLoading;

  const handleComplete = () => {
    if (!successfulIdentifier) {
      console.error(
        'No successful identifier found while initiating login biometric challenge',
      );
      return;
    }

    if (mutLoginChallenge.isLoading) {
      return;
    }

    mutLoginChallenge.mutate(
      {
        identifier: successfulIdentifier,
        preferredChallengeKind: ChallengeKind.biometric,
      },
      {
        onError: error => {
          console.error(
            `Error while requesting login biometric challenge: ${getErrorMessage(
              error,
            )}`,
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
      console.error(
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
        onSuccess: ({ authToken }) => {
          send({ type: 'challengeSucceeded', payload: { authToken } });
        },
        onError: (error: unknown) => {
          console.error(
            `Error while verifying biometric challenge: ${getErrorMessage(
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
      loading={mutLoginChallenge.isLoading}
      onClick={handleComplete}
      prefixIcon={IcoFaceid24}
    >
      {t('cta')}
    </Button>
  );
};

export default Biometric;
