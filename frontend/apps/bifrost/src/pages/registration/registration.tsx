import React, { useState } from 'react';
import { Container } from 'ui';

import Verify from './components/phone-registration';

const Registration = () => {
  const [step] = useState('verify');
  return (
    <Container sx={{ marginTop: 5 }}>
      {step === 'verify' && <Verify />}
    </Container>
  );
};
export default Registration;
