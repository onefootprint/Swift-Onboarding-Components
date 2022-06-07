import React from 'react';
import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import useIdentifyVerify, {
  IdentifyVerifyResponse,
} from 'src/hooks/identify/use-identify-verify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import { ChallengeKind } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Box, LinkButton, LoadingIndicator, PinInput, Typography } from 'ui';

import useOnboarding, { OnboardingResponse } from './hooks/use-onboarding';

const PhoneVerification = () => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();
  const onboardingMutation = useOnboarding();
  const shouldShowLoading =
    identifyMutation.isLoading ||
    identifyVerifyMutation.isLoading ||
    onboardingMutation.isLoading;

  const resendVerification = () => {
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
              challenge: newChallenge,
            },
          });
        },
      },
    );
  };

  const handlePinValidationSucceeded = ({
    authToken,
  }: IdentifyVerifyResponse) => {
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess({
          missingAttributes,
          missingWebauthnCredentials,
        }: OnboardingResponse) {
          send({
            type: Events.smsChallengeSucceeded,
            payload: {
              authToken,
              missingAttributes,
              missingWebauthnCredentials,
            },
          });
        },
      },
    );
  };

  const validatePin = (pin: string) => {
    const { challenge } = state.context;
    if (!challenge) {
      return;
    }
    const { challengeToken, challengeKind } = challenge;
    identifyVerifyMutation.mutate(
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

  return (
    <Form>
      <Box>
        <Typography variant="heading-2" color="primary">
          {state.context.userFound
            ? 'Welcome back! 🎉'
            : "Let's verify your identity!"}
        </Typography>
        <Typography variant="body-2" color="secondary">
          Enter the 6-digit code sent to (•••) ••• ••
          {state.context.challenge?.phoneNumberLastTwo}.
        </Typography>
      </Box>
      {shouldShowLoading ? (
        <>
          <LoadingIndicator />
          <Typography variant="label-3">Verifying...</Typography>
        </>
      ) : (
        <>
          <PinInput onComplete={validatePin} />
          <LinkButton onClick={resendVerification}>Resend code</LinkButton>
        </>
      )}
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default PhoneVerification;
