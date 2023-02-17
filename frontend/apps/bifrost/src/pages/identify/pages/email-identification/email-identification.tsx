import React from 'react';

import LoginChallengeBottomSheetProvider from '../../components/login-challenge-bottom-sheet/login-challenge-bottom-sheet-provider';
import EmailIdentificationContent from './components/email-identification-content';

const EmailIdentification = () => (
  <LoginChallengeBottomSheetProvider>
    <EmailIdentificationContent />
  </LoginChallengeBottomSheetProvider>
);

export default EmailIdentification;
