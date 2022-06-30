import React from 'react';
import NavigationHeader from 'src/components/navigation-header';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useIdentifyVerification from 'src/hooks/use-identify-verification';
import styled, { css } from 'styled-components';
import { Box, Typography } from 'ui';

import PhoneVerificationLoading from './components/phone-verification-loading';
import PhoneVerificationPinForm from './components/phone-verification-pin-form';
import PhoneVerificationSuccess from './components/phone-verification-success';
import useOnboarding from './hooks/use-onboarding';

const PhoneVerification = () => {
  const [state, send] = useBifrostMachine();
  const identifyVerificationMutation = useIdentifyVerification();
  const onboardingMutation = useOnboarding();

  const shouldShowForm =
    identifyVerificationMutation.isIdle || identifyVerificationMutation.isError;
  const shouldShowLoading =
    identifyVerificationMutation.isLoading || onboardingMutation.isLoading;
  const shouldShowSuccess = onboardingMutation.isSuccess;

  return (
    <>
      <NavigationHeader
        button={{
          variant: 'back',
          onClick: () => {
            send(Events.navigatedToPrevPage);
          },
        }}
      />
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
            verifyMutation={identifyVerificationMutation}
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
