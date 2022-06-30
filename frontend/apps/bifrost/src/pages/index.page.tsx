import has from 'lodash/has';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { States } from 'src/utils/state-machine/bifrost';

import BiometricLoginRetry from './biometric-login-retry';
import ConfirmAndAuthorize from './confirm-and-authorize';
import EmailIdentification from './email-identification';
import Init from './init';
import Onboarding from './onboarding';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import PhoneIdentification from './phone-identification';
import PhoneVerification from './phone-verification';
import TenantInvalid from './tenant-invalid';
import VerificationSuccess from './verification-success';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  const [state] = useBifrostMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.init]: Init,
    [States.tenantInvalid]: TenantInvalid,

    [States.emailIdentification]: EmailIdentification,
    [States.confirmAndAuthorize]: ConfirmAndAuthorize,
    [States.verificationSuccess]: VerificationSuccess,
    [States.phoneIdentification]: PhoneIdentification,
    [States.phoneVerification]: PhoneVerification,
    [States.biometricLoginRetry]: BiometricLoginRetry,

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
