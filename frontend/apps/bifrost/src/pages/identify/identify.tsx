import { useLogStateMachine } from '@onefootprint/dev-tools';
import { withProvider } from '@onefootprint/footprint-elements';
import React from 'react';
import MachineProvider, {
  useIdentifyMachine,
} from 'src/components/identify-machine-provider';
import { States } from 'src/utils/state-machine/identify';

import BootstrapChallenge from './pages/bootstrap-challenge';
import Challenge from './pages/challenge';
import EmailIdentification from './pages/email-identification';
import InitBootstrap from './pages/init-bootstrap';
import PhoneIdentification from './pages/phone-identification';

const Identify = () => {
  const [state] = useIdentifyMachine();
  useLogStateMachine('identify', state);

  if (state.matches(States.initBootstrap)) {
    return <InitBootstrap />;
  }
  if (state.matches(States.bootstrapChallenge)) {
    return <BootstrapChallenge />;
  }
  if (state.matches(States.emailIdentification)) {
    return <EmailIdentification />;
  }
  if (state.matches(States.phoneIdentification)) {
    return <PhoneIdentification />;
  }
  if (state.matches(States.challenge)) {
    return <Challenge />;
  }
  return null;
};

export default () => withProvider(MachineProvider, Identify);
