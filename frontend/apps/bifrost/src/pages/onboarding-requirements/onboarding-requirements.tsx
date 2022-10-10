import {
  CollectKycData,
  IdScan,
  Transfer,
  withProvider,
} from 'footprint-elements';
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
    missingKycData,
    missingLiveness,
    missingIdDocument,
    userFound,
  } = state.context;

  if (state.matches(States.checkOnboardingRequirements)) {
    return <CheckOnboardingRequirements />;
  }
  if (state.matches(States.additionalInfoRequired)) {
    return <AdditionalInfoRequired />;
  }
  if (state.matches(States.collectKycData)) {
    return (
      <CollectKycData
        context={{
          authToken,
          device,
          tenant,
          customData: {
            missingAttributes: missingKycData,
            userFound,
          },
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.collectKycDataCompleted });
        }}
      />
    );
  }
  if (state.matches(States.transfer)) {
    return (
      <Transfer
        context={{
          authToken,
          device,
          tenant,
          customData: {
            missingRequirements: {
              liveness: !!missingLiveness,
              idScan: !!missingIdDocument,
            },
          },
        }}
        metadata={{}}
        onDone={() => {
          send({ type: Events.transferCompleted });
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
          tenant,
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
