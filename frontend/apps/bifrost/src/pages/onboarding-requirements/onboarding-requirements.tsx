import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  CollectKycData,
  DeviceSignals,
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
    onboardingContext: { authToken, device, userFound, email, config },
    requirements: { kycData, liveness, idDoc, selfie },
  } = state.context;
  useLogStateMachine('onboarding-requirements', state);

  const handleRequirementCompleted = () => {
    send({
      type: Events.requirementCompleted,
    });
  };

  if (state.matches(States.checkOnboardingRequirements)) {
    return <CheckOnboardingRequirements />;
  }
  if (state.matches(States.additionalInfoRequired)) {
    return (
      <DeviceSignals page="additional-info-required" fpAuthToken={authToken}>
        <AdditionalInfoRequired />
      </DeviceSignals>
    );
  }
  if (state.matches(States.kycData)) {
    return (
      <DeviceSignals page="kyc-data" fpAuthToken={authToken}>
        <CollectKycData
          context={{
            authToken,
            device,
            customData: {
              missingAttributes: kycData,
              userFound,
              email,
              config,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches(States.transfer)) {
    return (
      <DeviceSignals page="transfer" fpAuthToken={authToken}>
        <Transfer
          context={{
            authToken,
            device,
            customData: {
              missingRequirements: {
                liveness,
                idDoc,
              },
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches(States.idDoc)) {
    return (
      <DeviceSignals page="id-doc" fpAuthToken={authToken}>
        <IdDoc
          context={{
            authToken,
            device,
            customData: {
              shouldCollectIdDoc: idDoc,
              shouldCollectSelfie: selfie,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches(States.identityCheck)) {
    return <IdentityCheck />;
  }
  return null;
};

export default () => withProvider(MachineProvider, OnboardingRequirements);
