import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoFaceid24 } from '@onefootprint/icons';
import { getBiometricChallengeResponse } from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import type { Identifier, LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { Button, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import { useIdentifyVerify, useLoginChallenge } from '../../hooks';
import { useAuthMachine } from '../../state';

const isAuthFlow = (x: unknown): x is 'auth' => x === 'auth';

const Biometric = () => {
  const [state, send] = useAuthMachine();
  const {
    identify: { successfulIdentifier, sandboxId, phoneNumber },
    obConfigAuth,
    config: { kind },
  } = state.context;
  const { t } = useTranslation('pages.auth.passkey-challenge');
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
      return;
    }

    if (loginChallengeMutation.isLoading) {
      return;
    }

    loginChallengeMutation.mutate(
      {
        identifier: successfulIdentifier,
        obConfigAuth,
        preferredChallengeKind: ChallengeKind.biometric,
        sandboxId,
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
        onSuccess: payload => {
          handleRequestChallengeSuccess(payload, successfulIdentifier);
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
        scope: isAuthFlow(kind) ? 'auth' : 'onboarding',
        identifier: isAuthFlow(kind)
          ? ({ ...identifier, phoneNumber } as Identifier)
          : identifier,
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
      loading={isLoading}
      onClick={handleComplete}
      prefixIcon={IcoFaceid24}
    >
      {isRetry ? t('cta-retry') : t('cta')}
    </Button>
  );
};

export default Biometric;
