import React from 'react';

import LoginChallengePickerProvider from '../../components/login-challenge-picker/login-challenge-picker-provider';
import EmailIdentificationContent from './components/email-identification-content';

const EmailIdentification = () => (
  <LoginChallengePickerProvider>
    <EmailIdentificationContent />
  </LoginChallengePickerProvider>
);

export default EmailIdentification;
