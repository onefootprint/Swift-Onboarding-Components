import { useLogStateMachine } from '@onefootprint/dev-tools';
import { withProvider } from '@onefootprint/footprint-elements';
import React from 'react';
import MachineProvider, {
  useIdentifyMachine,
} from 'src/components/identify-machine-provider';
import { States } from 'src/utils/state-machine/identify';

import BiometricLoginRetry from './pages/biometric-login-retry';
import BootstrapChallenge from './pages/bootstrap-challenge';
import EmailIdentification from './pages/email-identification';
import InitBootstrap from './pages/init-bootstrap';
import LegacyProcessBootstrapData from './pages/legacy-process-bootstrap-data';
import PhoneRegistration from './pages/phone-registration';
import PhoneVerification from './pages/phone-verification';

const Identify = () => {
  const [state] = useIdentifyMachine();
  useLogStateMachine('identify', state);

  // Legacy bootstrap pages
  if (state.matches(States.legacyProcessBootstrapData)) {
    return <LegacyProcessBootstrapData />;
  }

  // New bootstrap pages
  if (state.matches(States.initBootstrap)) {
    return <InitBootstrap />;
  }
  if (state.matches(States.bootstrapChallenge)) {
    return <BootstrapChallenge />;
  }

  // Other pages
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
