import { D2P, IdScan, WebAuthn, withProvider } from 'footprint-elements';
import has from 'lodash/has';
import React from 'react';
import { States } from 'src/utils/state-machine/onboarding';

import MachineProvider from './components/machine-provider';
import useOnboardingMachine, { Events } from './hooks/use-onboarding-machine';
import AdditionalInfoRequired from './pages/additional-info-required';
import OnboardingVerification from './pages/onboarding-verification/onboarding-verification';

type Page = {
  [page in States]?: () => JSX.Element;
};

const Onboarding = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken, device, tenant, missingWebauthnCredentials } =
    state.context;
  const valueCasted = state.value as States;

  if (state.matches(States.collectKycData)) {
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
  if (state.matches(States.d2p)) {
    return (
      <D2P
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
  if (state.matches(States.idScan)) {
    return (
      <IdScan
        context={{
          authToken,
          device,
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.idScanCompleted });
        }}
      />
    );
  }

  const pages: Page = {
    [States.onboardingVerification]: OnboardingVerification,
    [States.additionalInfoRequired]: AdditionalInfoRequired,
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
