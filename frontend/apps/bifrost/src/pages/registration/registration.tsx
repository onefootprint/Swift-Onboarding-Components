import React, { useState } from 'react';
import { Container } from 'ui';

import BasicInformation from './components/basic-information';
import LivenessCheck from './components/liveness-check';
import PhoneRegistration from './components/phone-registration';
import ResidentialAddress from './components/residential-address';
import SSN from './components/ssn';

enum Step {
  phoneRegistration = 'phoneRegistration',
  livenessCheck = 'livenessCheck',
  basicInformation = 'basicInformation',
  residentialAddress = 'residentialAddress',
  ssn = 'ssn',
}

const Registration = () => {
  const [step] = useState(Step.ssn);
  return (
    <Container sx={{ marginTop: 5 }}>
      {step === Step.basicInformation && <BasicInformation />}
      {step === Step.phoneRegistration && <PhoneRegistration />}
      {step === Step.livenessCheck && <LivenessCheck />}
      {step === Step.residentialAddress && <ResidentialAddress />}
      {step === Step.ssn && <SSN />}
    </Container>
  );
};
export default Registration;
