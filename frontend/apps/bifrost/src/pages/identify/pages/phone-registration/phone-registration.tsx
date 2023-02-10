import React from 'react';

import LoginChallengePickerProvider from '../../components/login-challenge-picker/login-challenge-picker-provider';
import PhoneRegistrationContent from './components/phone-registration-content/phone-registration-content';

const PhoneRegistration = () => (
  <LoginChallengePickerProvider>
    <PhoneRegistrationContent />
  </LoginChallengePickerProvider>
);

export default PhoneRegistration;
