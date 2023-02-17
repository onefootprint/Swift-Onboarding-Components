import React from 'react';

import LoginChallengeBottomSheetProvider from '../../components/login-challenge-bottom-sheet/login-challenge-bottom-sheet-provider';
import PhoneRegistrationContent from './components/phone-registration-content/phone-registration-content';

const PhoneRegistration = () => (
  <LoginChallengeBottomSheetProvider>
    <PhoneRegistrationContent />
  </LoginChallengeBottomSheetProvider>
);

export default PhoneRegistration;
