import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { States } from 'src/utils/state-machine/bifrost';

import AuthenticationSuccess from './authentication-success';
import Identify from './identify';
import Init from './init';
import Onboarding from './onboarding';
import Success from './success';
import TenantInvalid from './tenant-invalid';

const Root = () => {
  const [state] = useBifrostMachine();
  if (state.matches(States.init)) {
    return <Init />;
  }
  if (state.matches(States.tenantInvalid)) {
    return <TenantInvalid />;
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
