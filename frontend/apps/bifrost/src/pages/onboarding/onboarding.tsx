import { withProvider } from 'footprint-elements';
import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/onboarding';

import LivenessRegister from '../liveness-register';
import MachineProvider, {
  useOnboardingMachine,
} from './components/machine-provider';
import AdditionalInfoRequired from './pages/additional-info-required';
import BasicInformation from './pages/basic-information';
import OnboardingVerification from './pages/onboarding-verification/onboarding-verification';
import ResidentialAddress from './pages/residential-address';
import SSN from './pages/ssn';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Onboarding = () => {
  const [state] = useOnboardingMachine();
  const valueCasted = state.value as States;
  const pages: Page = {
    [States.onboardingVerification]: OnboardingVerification,
    [States.additionalDataRequired]: AdditionalInfoRequired,
    [States.livenessRegister]: LivenessRegister,
    [States.basicInformation]: BasicInformation,
    [States.residentialAddress]: ResidentialAddress,
    [States.ssn]: SSN,
  };
  if (has(pages, valueCasted)) {
    const Page = pages[valueCasted];
    if (Page) {
      return <Page />;
    }
  }
  return null;
};

export default () => withProvider(MachineProvider, Onboarding);
