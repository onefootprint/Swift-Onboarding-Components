import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { States } from 'src/utils/state-machine/bifrost';

import AuthenticationSuccess from './authentication-success';
import Identify from './identify';
import Init from './init';
import Onboarding from './onboarding';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import TenantInvalid from './tenant-invalid';
import VerificationSuccess from './verification-success';

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
  if (state.matches(States.verificationSuccess)) {
    return <VerificationSuccess />;
  }
  if (state.matches(States.onboardingSuccess)) {
    return <OnboardingSuccess />;
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
