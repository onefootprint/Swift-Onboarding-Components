import React, { useState } from 'react';
import { Container } from 'ui';

import BasicInformation from './components/basic-information';
import ResidentialAddress from './components/residential-address';
import Verify from './components/verify';

const Onboarding = () => {
  const [step] = useState('residential-address');
  return (
    <Container sx={{ marginTop: 5 }}>
      {step === 'verify' && <Verify />}
      {step === 'basic-information' && <BasicInformation />}
      {step === 'residential-address' && <ResidentialAddress />}
    </Container>
  );
};
export default Onboarding;
