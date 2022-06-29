import React from 'react';
import useIdentifyVerify from 'src/hooks/identify/use-identify-verify';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled-components';
import { Box, Typography } from 'ui';

import PhoneVerificationLoading from './components/phone-verification-loading';
import PhoneVerificationPinForm from './components/phone-verification-pin-form';
import PhoneVerificationSuccess from './components/phone-verification-success';
import PrevHeader from './components/prev-header';
import useOnboarding from './hooks/use-onboarding';

const PhoneVerification = () => {
  const [state] = useBifrostMachine();
  const verifyMutation = useIdentifyVerify();
  const onboardingMutation = useOnboarding();

  const shouldShowForm = verifyMutation.isIdle || verifyMutation.isError;
  const shouldShowLoading =
    verifyMutation.isLoading || onboardingMutation.isLoading;
  const shouldShowSuccess = onboardingMutation.isSuccess;

  return (
    <>
      <PrevHeader />
      <Form>
        <Box>
          <Typography variant="heading-2" color="primary">
            {state.context.userFound
              ? 'Welcome back! 🎉'
              : "Let's verify your identity!"}
          </Typography>
          <Typography variant="body-2" color="secondary">
            Enter the 6-digit code sent to (•••) ••• ••
            {state.context.challenge?.phoneNumberLastTwo ??
              state.context.phone?.slice(-2)}
            .
          </Typography>
        </Box>
        {shouldShowForm && (
          <PhoneVerificationPinForm
            verifyMutation={verifyMutation}
            onboardingMutation={onboardingMutation}
          />
        )}
        {shouldShowLoading && <PhoneVerificationLoading />}
        {shouldShowSuccess && <PhoneVerificationSuccess />}
      </Form>
    </>
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
