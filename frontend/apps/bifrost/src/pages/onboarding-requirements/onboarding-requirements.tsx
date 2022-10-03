import { D2P, IdScan, WebAuthn, withProvider } from 'footprint-elements';
import React from 'react';
import {
  Events,
  States,
} from 'src/utils/state-machine/onboarding-requirements';

import MachineProvider from './components/machine-provider';
import useOnboardingRequirementsMachine from './hooks/use-onboarding-requirements-machine';
import AdditionalInfoRequired from './pages/additional-info-required';
import CheckOnboardingRequirements from './pages/check-onboarding-requirements';

const OnboardingRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    authToken,
    device,
    tenant,
    missingWebauthnCredentials,
    missingIdDocument,
  } = state.context;

  if (state.matches(States.checkOnboardingRequirements)) {
    return <CheckOnboardingRequirements />;
  }
  if (state.matches(States.additionalInfoRequired)) {
    return <AdditionalInfoRequired />;
  }
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
              idScan: !!missingIdDocument,
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
  return null;
};

export default () => withProvider(MachineProvider, OnboardingRequirements);
