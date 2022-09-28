import { D2PPlugin, WebAuthn, withProvider } from 'footprint-elements';
import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/onboarding';

import MachineProvider from './components/machine-provider';
import useOnboardingMachine, { Events } from './hooks/use-onboarding-machine';
import AdditionalInfoRequired from './pages/additional-info-required';
import BasicInformation from './pages/basic-information';
import OnboardingVerification from './pages/onboarding-verification/onboarding-verification';
import ResidentialAddress from './pages/residential-address';
import SSN from './pages/ssn';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Onboarding = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken, device, tenant, missingWebauthnCredentials } =
    state.context;
  const valueCasted = state.value as States;

  if (state.matches(States.d2p)) {
    return (
      <D2PPlugin
        context={{
          authToken,
          device,
          tenant,
          customData: {
            missingRequirements: {
              webAuthn: !!missingWebauthnCredentials,
              idScan: true, // TODO: derive this from the requirements sent from API
            },
          },
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.d2pCompleted });
        }}
      />
    );
  }
  if (state.matches(States.webAuthn)) {
    return (
      <WebAuthn
        context={{
          authToken,
          device,
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.webAuthnCompleted });
        }}
      />
    );
  }

  const pages: Page = {
    [States.onboardingVerification]: OnboardingVerification,
    [States.additionalDataRequired]: AdditionalInfoRequired,
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
