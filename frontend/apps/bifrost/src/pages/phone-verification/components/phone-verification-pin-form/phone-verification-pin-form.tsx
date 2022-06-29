import React from 'react';
import { UseMutationResult } from 'react-query';
import { RequestError } from 'request';
import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from 'src/hooks/identify/use-identify-verify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import { ChallengeKind } from 'src/utils/state-machine/types';
import { LinkButton, LoadingIndicator, PinInput } from 'ui';

import {
  OnboardingRequest,
  OnboardingResponse,
} from '../../hooks/use-onboarding';

// Once verification succeeds, delay the transition to next page while you show a success message
const SUCCESS_EVENT_DELAY_MS = 1500;

type PhoneVerificationPinFormProps = {
  verifyMutation: UseMutationResult<
    IdentifyVerifyResponse,
    RequestError,
    IdentifyVerifyRequest
  >;
  onboardingMutation: UseMutationResult<
    OnboardingResponse,
    RequestError,
    OnboardingRequest
  >;
};

const PhoneVerificationPinForm = ({
  verifyMutation,
  onboardingMutation,
}: PhoneVerificationPinFormProps) => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    const tenantPk = state.context.tenant.pk;
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess({
          missingAttributes,
          missingWebauthnCredentials,
        }: OnboardingResponse) {
          setTimeout(() => {
            send({
              type: Events.smsChallengeSucceeded,
              payload: {
                authToken,
                missingAttributes,
                missingWebauthnCredentials,
              },
            });
          }, SUCCESS_EVENT_DELAY_MS);
        },
      },
    );
  };

  const handleComplete = (pin: string) => {
    const { challenge } = state.context;
    if (!challenge) {
      return;
    }
    const { challengeToken, challengeKind } = challenge;
    verifyMutation.mutate(
      {
        challengeKind,
        challengeResponse: pin,
        challengeToken,
      },
      {
        onSuccess: handlePinValidationSucceeded,
      },
    );
  };

  const handleResend = () => {
    const { email } = state.context;
    identifyMutation.mutate(
      { identifier: { email }, preferredChallengeKind: ChallengeKind.sms },
      {
        onSuccess({ challengeData: newChallenge }: IdentifyResponse) {
          if (!newChallenge) {
            return;
          }
          send({
            type: Events.smsChallengeResent,
            payload: {
              challengeData: newChallenge,
            },
          });
        },
      },
    );
  };

  return (
    <>
      <PinInput
        onComplete={handleComplete}
        hasError={verifyMutation.isError}
        hintText={
          verifyMutation.isError ? 'Incorrect verification code.' : undefined
        }
      />
      {identifyMutation.isLoading ? (
        <LoadingIndicator />
      ) : (
        <LinkButton onClick={handleResend}>Resend code</LinkButton>
      )}
    </>
  );
};

export default PhoneVerificationPinForm;
