import { IcoFaceid24, IcoSmartphone24 } from '@onefootprint/icons';
import { getBiometricChallengeResponseV2 } from '@onefootprint/idv';
import type {
  ChallengeData,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import type { SXStyleProps } from '@onefootprint/ui';
import { Button, Stack, Typography, useToast } from '@onefootprint/ui';
import noop from 'lodash/fp/noop';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentifyVerify, useLoginChallenge } from '@/src/queries';
import { useUserMachine } from '@/src/state';
import type { HeaderProps } from '@/src/types';
import { getErrorToastVariant, getLogger } from '@/src/utils';

type ChallengeVerifyPasskeyProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  onChallengeVerificationSuccess: (res: IdentifyVerifyResponse) => void;
  onLoginChallengeSuccess: (res: ChallengeData) => void;
  onSmsButtonClick: (k: ChallengeKind) => void;
};

const marginBottom6 = { marginBottom: 6 } as SXStyleProps;
const { logInfo, logError } = getLogger('challenge-verify-passkey');

const ChallengeVerifyPasskey = ({
  children,
  Header,
  onChallengeVerificationSuccess,
  onLoginChallengeSuccess,
  onSmsButtonClick,
}: ChallengeVerifyPasskeyProps) => {
  const [state] = useUserMachine();
  const { authToken } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'passkey-challenge',
  });
  const toast = useToast();
  const mutLoginChallenge = useLoginChallenge({});
  const mutIdentifyVerify = useIdentifyVerify({ authToken });
  const [isRunningWebauthn, setIsRunningWebauthn] = useState(false);
  const isAuthenticating = isRunningWebauthn || mutIdentifyVerify.isLoading;

  const verifyBiometricChallengeResponse = async (res: ChallengeData) => {
    const { biometricChallengeJson, challengeToken } = res;
    if (!biometricChallengeJson || !challengeToken) {
      logError('Missing required data for biometric challenge');
      return;
    }

    let pkResponse;
    try {
      pkResponse = await getBiometricChallengeResponseV2(
        biometricChallengeJson,
      );
    } catch (e) {
      logError('Unable to generate biometric challenge response', e);
      toast.show({
        description: t('error.description'),
        title: t('error.title'),
        variant: 'error',
      });
    }

    if (!pkResponse) {
      logInfo('Missing challenge response. Aborting web authentication');
      setIsRunningWebauthn(false);
      return;
    }

    if (mutIdentifyVerify.isLoading) {
      logInfo('Verify query is in progress. Skipping verification');
      return;
    }

    mutIdentifyVerify.mutate(
      { challengeResponse: pkResponse, challengeToken },
      {
        onError: err => {
          logError('Error while verifying biometric challenge', err);
        },
        onSuccess: onChallengeVerificationSuccess,
        onSettled: () => setIsRunningWebauthn(false),
      },
    );
  };

  const handleOnClick = (innerKind: ChallengeKind) => {
    if (!authToken) {
      logError('No Identifier found for login biometric challenge');
      return;
    }

    mutLoginChallenge.mutate(
      { authToken, preferredChallengeKind: innerKind },
      {
        onError: err => {
          toast.show(getErrorToastVariant(err));
          logError('Error while requesting login biometric challenge: ', err);
        },
        onSuccess: async res => {
          const { challengeData, error } = res;
          if (error) {
            toast.show(getErrorToastVariant(res.error));
            return;
          }

          if (challengeData.challengeKind !== innerKind) {
            logError('Unexpected SMS challenge after biometric request');
            return;
          }

          onLoginChallengeSuccess(res.challengeData);
          await verifyBiometricChallengeResponse(challengeData);
        },
      },
    );
  };

  return (
    <>
      <Stack
        align="center"
        backgroundColor="primary"
        direction="column"
        gap={7}
        justify="center"
      >
        <Header title={t('title')} />
        <Stack
          align="center"
          direction="column"
          gap={5}
          justify="center"
          width="100%"
        >
          {isAuthenticating ? (
            <Typography color="secondary" sx={marginBottom6} variant="label-3">
              {t('loading')}
            </Typography>
          ) : (
            <Button
              fullWidth
              loading={mutLoginChallenge.isLoading}
              prefixIcon={IcoFaceid24}
              onClick={
                mutLoginChallenge.isLoading
                  ? noop
                  : () => handleOnClick(ChallengeKind.biometric)
              }
            >
              {t('cta')}
            </Button>
          )}
          <Button
            fullWidth
            onClick={() => onSmsButtonClick(ChallengeKind.sms)}
            prefixIcon={IcoSmartphone24}
            variant="secondary"
          >
            {t('login-with-sms')}
          </Button>
        </Stack>
      </Stack>
      {children}
    </>
  );
};

export default ChallengeVerifyPasskey;
