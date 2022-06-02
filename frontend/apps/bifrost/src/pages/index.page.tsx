import has from 'lodash/has';
import React from 'react';
import { States } from 'src/bifrost-machine/types';
import useBifrostMachine from 'src/hooks/bifrost-machine';
import useDeviceHasWebAuthnSupport from 'src/hooks/webauthn-support';

import EmailIdentification from './email-identification';
import AdditionalInfoRequired from './onboarding/components/additional-info-required';
import BasicInformation from './onboarding/components/basic-information';
import PhoneRegistration from './onboarding/components/phone-registration';
import ResidentialAddress from './onboarding/components/residential-address';
import SSN from './onboarding/components/ssn';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import PhoneVerification from './phone-verification';
import VerificationSuccess from './verification-success';

const Root = () => {
  const [state] = useBifrostMachine();
  useDeviceHasWebAuthnSupport();
  const valueCasted = state.value as keyof typeof States as States;
  const pages: Record<States, () => JSX.Element> = {
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
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    return <Page />;
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
