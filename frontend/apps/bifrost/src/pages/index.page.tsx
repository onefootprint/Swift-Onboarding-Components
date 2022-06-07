import has from 'lodash/has';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useDevice from 'src/hooks/use-device-info';
import { States } from 'src/utils/state-machine/bifrost';

import EmailIdentification from './email-identification';
import BiometricLoginRetry from './liveness-login/biometric-login-retry';
import QRLogin from './liveness-login/qr-login';
import Onboarding from './onboarding';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import PhoneRegistration from './phone-registration';
import PhoneVerification from './phone-verification';
import VerificationSuccess from './verification-success';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  useDevice();
  const [state] = useBifrostMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.emailIdentification]: EmailIdentification,
    [States.verificationSuccess]: VerificationSuccess,
    [States.phoneRegistration]: PhoneRegistration,
    [States.phoneVerification]: PhoneVerification,
    [States.biometricLoginRetry]: BiometricLoginRetry,
    [States.qrLogin]: QRLogin,

    // Onboarding
    [States.onboarding]: Onboarding,
    [States.onboardingSuccess]: OnboardingSuccess,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
