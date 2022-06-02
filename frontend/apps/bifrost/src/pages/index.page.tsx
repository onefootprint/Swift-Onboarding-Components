import has from 'lodash/has';
import React from 'react';
import { States } from 'src/bifrost-machine/types';
import useBifrostMachine from 'src/hooks/bifrost/use-bifrost-machine';

import EmailIdentification from './email-identification';
import AdditionalInfoRequired from './onboarding/components/additional-info-required';
import BasicInformation from './onboarding/components/basic-information';
import PhoneRegistration from './onboarding/components/phone-registration';
import ResidentialAddress from './onboarding/components/residential-address';
import SSN from './onboarding/components/ssn';
import PhoneVerification from './phone-verification';
import RegistrationSuccess from './registration-success/registration-success';
import VerificationSuccess from './verification-success';

const Root = () => {
  const [state] = useBifrostMachine();
  const valueCasted = state.value as keyof typeof States;
  const pages: Record<States, () => JSX.Element> = {
    [States.emailIdentification]: EmailIdentification,
    [States.phoneVerification]: PhoneVerification,
    [States.verificationSuccess]: VerificationSuccess,
    [States.additionalInfoRequired]: AdditionalInfoRequired,
    [States.phoneRegistration]: PhoneRegistration,
    [States.basicInformation]: BasicInformation,
    [States.residentialAddress]: ResidentialAddress,
    [States.ssn]: SSN,
    [States.registrationSuccess]: RegistrationSuccess,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    return <Page />;
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
