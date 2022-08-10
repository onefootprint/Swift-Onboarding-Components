import has from 'lodash/has';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { States } from 'src/utils/state-machine/bifrost';

import AuthenticationSuccess from './authentication-success';
import ConfirmAndAuthorize from './confirm-and-authorize';
import Identify from './identify';
import Init from './init';
import Onboarding from './onboarding';
import OnboardingSuccess from './onboarding-success/onboarding-success';
import TenantInvalid from './tenant-invalid';
import VerificationSuccess from './verification-success';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Root = () => {
  const [state] = useBifrostMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.init]: Init,
    [States.tenantInvalid]: TenantInvalid,
    [States.confirmAndAuthorize]: ConfirmAndAuthorize,
    [States.identify]: Identify,
    [States.verificationSuccess]: VerificationSuccess,
    [States.onboarding]: Onboarding,
    [States.onboardingSuccess]: OnboardingSuccess,
    [States.authenticationSuccess]: AuthenticationSuccess,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  // TODO: SHOW 404
  return null;
};

export default Root;
