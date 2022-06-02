import React from 'react';
import { ChallengeKind, Events } from 'src/bifrost-machine/types';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';
import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import useIdentifyVerify, {
  IdentifyVerifyResponse,
} from 'src/hooks/identify/use-identify-verify';
import styled, { css } from 'styled';
import { Box, LinkButton, LoadingIndicator, PinInput, Typography } from 'ui';

import useOnboarding, { OnboardingResponse } from './hooks/use-onboarding';

const PhoneVerification = () => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();
  const onboardingMutation = useOnboarding();

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
        onSuccess: ({ authToken }: IdentifyVerifyResponse) => {
          onboardingMutation.mutate(
            { authToken },
            {
              onSuccess({
                missingAttributes,
                missingWebauthnCredentials,
              }: OnboardingResponse) {
                send({
                  type: Events.challengeSucceeded,
                  payload: {
                    authToken,
                    missingAttributes,
                    missingWebauthnCredentials,
                  },
                });
              },
            },
          );
        },
      },
    );
  };

  const input =
    identifyMutation.isLoading ||
    identifyVerifyMutation.isLoading ||
    onboardingMutation.isLoading ? (
      <>
        <LoadingIndicator />
        <Typography variant="label-3">Verifying...</Typography>
      </>
    ) : (
      <>
        <PinInput onComplete={validatePin} />
        <LinkButton onClick={resendVerification}>Resend code</LinkButton>
      </>
    );

  return (
    <Form>
      <Box>
        <Typography variant="heading-2" color="primary">
          Welcome back! 🎉
        </Typography>
        <Typography variant="body-2" color="secondary">
          Enter the 6-digit code sent to (•••) ••• ••
          {state.context.challenge?.phoneNumberLastTwo}.
        </Typography>
      </Box>
      {input}
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
