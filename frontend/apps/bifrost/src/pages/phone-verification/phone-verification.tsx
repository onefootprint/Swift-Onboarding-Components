import React from 'react';
import { Events } from 'src/bifrost-machine/types';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useIdentifyEmail from 'src/hooks/use-identify-email';
import styled, { css } from 'styled';
import { Box, LinkButton, LoadingIndicator, PinInput, Typography } from 'ui';

import useOnboarding, { OnboardingResponse } from './hooks/use-onboarding';
import useVerifyPhone, {
  VerifyPhoneResponse,
  VerifyPhoneResponseKind,
} from './hooks/use-verify-phone';

const PhoneVerification = () => {
  const [state, send] = useBifrostMachine();
  const { email, phoneNumberLastTwo, challengeToken } =
    state.context.identification;

  const identifyEmailMutation = useIdentifyEmail();
  const verifyPhoneMutation = useVerifyPhone();
  const onboardingMutation = useOnboarding();

  const resendVerification = () => {
    if (!email) {
      return;
    }
    identifyEmailMutation.mutate({ email });
  };

  const validatePin = (pin: string) => {
    if (!challengeToken) {
      return;
    }
    verifyPhoneMutation.mutate(
      {
        code: pin,
        challengeToken,
      },
      {
        onSuccess: ({ authToken, kind }: VerifyPhoneResponse) => {
          if (!authToken) {
            return;
          }

          // TODO: handle errors better
          onboardingMutation.mutate(
            { authToken },
            {
              onSuccess({ missingAttributes }: OnboardingResponse) {
                if (kind === VerifyPhoneResponseKind.userCreated) {
                  send({
                    type: Events.userCreated,
                    payload: {
                      authToken,
                      missingAttributes: new Set(missingAttributes),
                    },
                  });
                } else if (kind === VerifyPhoneResponseKind.userInherited) {
                  send({
                    type: Events.userInherited,
                    payload: {
                      authToken,
                      missingAttributes: new Set(missingAttributes),
                    },
                  });
                }
              },
            },
          );
        },
      },
    );
  };

  const input =
    verifyPhoneMutation.isLoading || onboardingMutation.isLoading ? (
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
          {phoneNumberLastTwo}.
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
