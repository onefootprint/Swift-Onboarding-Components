import {
  CollectKycData,
  IdDoc,
  Transfer,
  withProvider,
} from '@onefootprint/footprint-elements';
import React from 'react';

import MachineProvider from './components/machine-provider';
import useOnboardingRequirementsMachine, {
  Events,
  States,
} from './hooks/use-onboarding-requirements-machine';
import AdditionalInfoRequired from './pages/additional-info-required';
import CheckOnboardingRequirements from './pages/check-onboarding-requirements';
import IdentityCheck from './pages/identity-check';

const OnboardingRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken, device, tenant, userFound },
    receivedRequirements: { kycData, liveness, idDoc },
  } = state.context;

  const handleRequirementCompleted = () => {
    send({
      type: Events.requirementCompleted,
    });
  };

  if (state.matches(States.checkOnboardingRequirements)) {
    return <CheckOnboardingRequirements />;
  }
  if (state.matches(States.additionalInfoRequired)) {
    return <AdditionalInfoRequired />;
  }
  if (state.matches(States.kycData)) {
    return (
      <CollectKycData
        context={{
          authToken,
          device,
          tenant,
          customData: {
            missingAttributes: kycData,
            userFound,
          },
        }}
        onDone={handleRequirementCompleted}
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
              liveness,
              idDoc,
            },
          },
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches(States.idDoc)) {
    return (
      <IdDoc
        context={{
          authToken,
          device,
          tenant,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches(States.identityCheck)) {
    return <IdentityCheck />;
  }
  return null;
};

export default () => withProvider(MachineProvider, OnboardingRequirements);
