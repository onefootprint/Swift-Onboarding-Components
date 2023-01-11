import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { States } from 'src/utils/state-machine/bifrost';

import AuthenticationSuccess from './authentication-success';
import ConfigInvalid from './config-invalid';
import Identify from './identify';
import Init from './init';
import Onboarding from './onboarding';
import Success from './success';

const Root = () => {
  const [state] = useBifrostMachine();
  if (state.matches(States.init)) {
    return <Init />;
  }
  if (state.matches(States.configInvalid)) {
    return <ConfigInvalid />;
  }
  if (state.matches(States.identify)) {
    return <Identify />;
  }
  if (state.matches(States.success)) {
    return <Success />;
  }
  if (state.matches(States.onboarding)) {
    return <Onboarding />;
  }
  if (state.matches(States.authenticationSuccess)) {
    return <AuthenticationSuccess />;
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
