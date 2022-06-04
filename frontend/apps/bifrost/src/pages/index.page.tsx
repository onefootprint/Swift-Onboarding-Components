import has from 'lodash/has';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useDevice from 'src/hooks/use-device-info';
import { States } from 'src/utils/state-machine/bifrost';

import EmailIdentification from './email-identification';
import LivenessRegister from './liveness-register';
import AdditionalInfoRequired from './onboarding/components/additional-info-required';
import BasicInformation from './onboarding/components/basic-information';
import PhoneRegistration from './onboarding/components/phone-registration';
import ResidentialAddress from './onboarding/components/residential-address';
import SSN from './onboarding/components/ssn';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import PhoneVerification from './phone-verification';
import VerificationSuccess from './verification-success';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  useDevice();
  const [state] = useBifrostMachine();

  if (state.children.livenessRegister) {
    return <LivenessRegister />;
  }

  const valueCasted = state.value as States;
  const pages: Page = {
    // Identify
    [States.emailIdentification]: EmailIdentification,
    [States.verificationSuccess]: VerificationSuccess,
    [States.phoneRegistration]: PhoneRegistration,

    // Challenge
    [States.phoneVerification]: PhoneVerification,

    // Onboarding
    [States.additionalDataRequired]: AdditionalInfoRequired,
    [States.basicInformation]: BasicInformation,
    [States.residentialAddress]: ResidentialAddress,
    [States.ssn]: SSN,
    [States.onboardingSuccess]: OnboardingSuccess,
  };
  // TODO: This needs to be fixed
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
