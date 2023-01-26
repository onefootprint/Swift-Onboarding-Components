import { useLogStateMachine } from '@onefootprint/dev-tools';
import { withProvider } from '@onefootprint/footprint-elements';
import React from 'react';
import MachineProvider, {
  useIdentifyMachine,
} from 'src/components/identify-machine-provider';
import { States } from 'src/utils/state-machine/identify';

import BiometricLoginRetry from './pages/biometric-login-retry';
import EmailIdentification from './pages/email-identification';
import PhoneRegistration from './pages/phone-registration';
import PhoneVerification from './pages/phone-verification';
import ProcessBootstrapData from './pages/process-bootstrap-data';

const Identify = () => {
  const [state] = useIdentifyMachine();
  useLogStateMachine('identify', state);

  if (state.matches(States.processBootstrapData)) {
    return <ProcessBootstrapData />;
  }
  if (state.matches(States.emailIdentification)) {
    return <EmailIdentification />;
  }
  if (state.matches(States.phoneRegistration)) {
    return <PhoneRegistration />;
  }
  if (state.matches(States.phoneVerification)) {
    return <PhoneVerification />;
  }
  if (state.matches(States.biometricLoginRetry)) {
    return <BiometricLoginRetry />;
  }
  return null;
};

export default () => withProvider(MachineProvider, Identify);
