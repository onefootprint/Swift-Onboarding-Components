import React, { useState } from 'react';
import { Container } from 'ui';

import BasicInformation from './components/basic-information';
import PhoneRegistration from './components/phone-registration';
import ResidentialAddress from './components/residential-address';

enum Step {
  phoneRegistration = 'phone-registration',
  basicInformation = 'basic-information',
  residentialAddress = 'residential-address',
}

const Registration = () => {
  const [step] = useState(Step.residentialAddress);
  return (
    <Container sx={{ marginTop: 5 }}>
      {step === Step.basicInformation && <BasicInformation />}
      {step === Step.phoneRegistration && <PhoneRegistration />}
      {step === Step.residentialAddress && <ResidentialAddress />}
    </Container>
  );
};
export default Registration;
