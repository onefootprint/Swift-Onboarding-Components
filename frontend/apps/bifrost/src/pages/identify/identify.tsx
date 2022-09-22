import { withProvider } from 'footprint-ui';
import has from 'lodash/has';
import React from 'react';
import MachineProvider, {
  useIdentifyMachine,
} from 'src/components/identify-machine-provider';
import { States } from 'src/utils/state-machine/identify';

import BiometricLoginRetry from './pages/biometric-login-retry';
import EmailIdentification from './pages/email-identification';
import PhoneRegistration from './pages/phone-registration';
import PhoneVerification from './pages/phone-verification';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Identify = () => {
  const [state] = useIdentifyMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.emailIdentification]: EmailIdentification,
    [States.phoneRegistration]: PhoneRegistration,
    [States.phoneVerification]: PhoneVerification,
    [States.biometricLoginRetry]: BiometricLoginRetry,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default () => withProvider(MachineProvider, Identify);
