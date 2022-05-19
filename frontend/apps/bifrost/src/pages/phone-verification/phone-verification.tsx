import React from 'react';
import useIdentifyEmail, {
  IdentifyEmailRequest,
} from 'src/hooks/use-identify-email';
import styled, { css } from 'styled';
import { Box, LinkButton, LoadingIndicator, PinInput, Typography } from 'ui';

import useVerifyPhone, {
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  VerifyPhoneResponseKind,
} from './hooks/use-verify-phone';

interface PhoneVerificationProps {
  email: string;
  phoneLastTwoDigits: string;
  onVerifyUser: () => void;
}

const PhoneVerification = ({
  email,
  phoneLastTwoDigits,
  onVerifyUser,
}: PhoneVerificationProps) => {
  const identifyEmailMutation = useIdentifyEmail();
  const verifyPhoneMutation = useVerifyPhone();

  const resendVerification = () => {
    const payload: IdentifyEmailRequest = { email };
    identifyEmailMutation.mutate(payload);
  };

  const validatePin = (pin: string) => {
    const payload: VerifyPhoneRequest = { code: pin };
    verifyPhoneMutation.mutate(payload, {
      onSuccess: (response: VerifyPhoneResponse) => {
        const responseData = response.data.data;
        if (responseData === VerifyPhoneResponseKind.UserFound) {
          onVerifyUser();
        } else {
          // TODO: handle this case better
        }
      },
    });
  };

  const input = verifyPhoneMutation.isLoading ? (
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
          {phoneLastTwoDigits}.
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
