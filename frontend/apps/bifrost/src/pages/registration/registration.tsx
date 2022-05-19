import React, { useState } from 'react';
import { Container } from 'ui';

import BasicInformation from './components/basic-information';
import PhoneRegistration from './components/phone-registration';

enum Step {
  phoneRegistration = 'phone-registration',
  basicInformation = 'basic-information',
}

const Registration = () => {
  const [step] = useState(Step.basicInformation);
  return (
    <Container sx={{ marginTop: 5 }}>
      {step === Step.phoneRegistration && <PhoneRegistration />}
      {step === Step.basicInformation && <BasicInformation />}
    </Container>
  );
};
export default Registration;
