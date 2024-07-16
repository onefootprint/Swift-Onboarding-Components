import {
  type ChallengeData,
  ChallengeKind,
  type IdentifyVerifyResponse,
  type ObConfigAuth,
  type SignupChallengeResponse,
} from '@onefootprint/types';
import { Box, PinInput, useToast } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';
import { useEffectOnce } from 'usehooks-ts';

import Header from '@/components/header';
import useIdentifyVerify from '@/hooks/use-identify-verify';
import useRequestError from '@/hooks/use-request-error';
import useRequestErrorToast from '@/hooks/use-request-error-toast';
import useSignupChallenge from '@/hooks/use-signup-challenge';
import useTranslation from '@/hooks/use-translation';
import type { IdentifyData } from '@/utils/state-machine/types';

import ResendButton from './components/resend-button';
import Success from './components/success';
import Verifying from './components/verifying';
import getScrubbedPhoneNumber from './utils/get-scrubbed-phone-number';

export type SmsChallengeProps = {
  identify?: IdentifyData;
  obConfigAuth: ObConfigAuth;
  onComplete: (authToken: string) => void;
  onChallengeReceived: (challengeData: ChallengeData) => void;
  sandboxId?: string;
};

// TODO: implement loginChallengeMutation for user-found case
const SmsChallenge = ({ identify, onComplete, obConfigAuth, onChallengeReceived, sandboxId }: SmsChallengeProps) => {
  const { t } = useTranslation('pages.sms-challenge');
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const requestError = useRequestError();
  const signupChallengeMutation = useSignupChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const { email, phoneNumber, successfulIdentifier } = identify?.identifyResult || {};
  const data = identify?.challengeData;
  const challengeData: ChallengeData | undefined = data || signupChallengeMutation.data?.challengeData;

  const { isLoading } = signupChallengeMutation;
  const isPending = isLoading || !challengeData;
  const isVerifying = identifyVerifyMutation.isLoading;
  const { isSuccess } = identifyVerifyMutation;

  // TODO: implement scrubbed phone number properly
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    phoneNumber,
    successfulIdentifier,
    challengeData,
  });

  const handlePinValidationSucceeded = ({ authToken }: IdentifyVerifyResponse) => {
    if (!authToken) {
      return;
    }

    // TODO: implement userFound case
    onComplete(authToken);
  };

  const verifyPin = (pin: string) => {
    if (!challengeData || identifyVerifyMutation.isLoading) {
      return;
    }

    const { challengeToken } = challengeData;
    identifyVerifyMutation.mutate(
      {
        challengeResponse: pin,
        challengeToken,
        obConfigAuth,
      },
      {
        onSuccess: handlePinValidationSucceeded,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleRequestChallengeSuccess = (payload: SignupChallengeResponse) => {
    if (payload.error) {
      showRequestErrorToast(payload.error);
    }

    if (payload.challengeData.challengeKind !== ChallengeKind.sms) {
      toast.show({
        title: t('toast.error.title'),
        description: t('toast.error.description'),
        variant: 'error',
      });
      return;
    }

    if (challengeData) {
      toast.show({
        title: t('toast.success.title'),
        description: t('toast.success.description'),
        variant: 'success',
      });
    }

    onChallengeReceived(payload.challengeData);
  };

  const initiateSignupChallenge = () => {
    if (!obConfigAuth) {
      return;
    }
    // TODO: Implement userFound case

    if (signupChallengeMutation.isLoading) {
      return;
    }

    signupChallengeMutation.mutate(
      {
        phoneNumber,
        email,
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: handleRequestChallengeSuccess,
        onError: (error: unknown) => {
          if (requestError.getErrorCode(error) === 'E120') {
            console.error('Entered signup challenge when the user already has a vault. Initiating login challenge');
            // TODO perform login challenge
            return;
          }
          showRequestErrorToast(error);
        },
      },
    );
  };

  const initiateChallenge = () => {
    // TODO: Implement userFound case
    initiateSignupChallenge();
  };

  const getShouldRequestNewChallenge = () => {
    const hasPreferredChallengeKind = challengeData?.challengeKind === ChallengeKind.sms;
    if (!hasPreferredChallengeKind) {
      return true;
    }
    const isRetryDisabled = challengeData?.retryDisabledUntil && challengeData.retryDisabledUntil > new Date();
    if (isRetryDisabled) {
      return false;
    }
    return true;
  };

  const handleResend = () => {
    const shouldResend = getShouldRequestNewChallenge();
    if (shouldResend) {
      initiateChallenge();
    }
  };

  useEffectOnce(() => {
    // Initiate a challenge if there is no challenge data or it is stale
    const shouldInitiateChallenge = getShouldRequestNewChallenge();
    if (shouldInitiateChallenge) {
      initiateChallenge();
    }
  });

  const shouldShowPinInput = !isSuccess && !isVerifying;

  // TODO: Title can be "welcome back" or "enter code" depending on state
  // TODO: User can have option to choose a different method of verification
  return (
    <Box width="100%">
      <Header title={t('title')} subtitle={t('subtitle', { scrubbedPhoneNumber })} />
      {shouldShowPinInput ? (
        <InputContainer>
          <PinInput
            onComplete={verifyPin}
            disabled={isPending}
            hasError={identifyVerifyMutation.isError}
            hint={identifyVerifyMutation.isError ? t('error') : undefined}
            autoFocus
          />
          <ResendButton
            isResendLoading={isLoading}
            resendDisabledUntil={challengeData?.retryDisabledUntil}
            onResend={handleResend}
          />
        </InputContainer>
      ) : (
        <>
          {isSuccess && <Success />}
          {isVerifying && <Verifying />}
        </>
      )}
    </Box>
  );
};

const InputContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default SmsChallenge;
