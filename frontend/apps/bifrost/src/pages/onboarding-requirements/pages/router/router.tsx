import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  CollectKybData,
  CollectKycData,
  DeviceSignals,
  IdDoc,
  InvestorProfile,
  Transfer,
} from '@onefootprint/footprint-elements';
import React, { useEffect } from 'react';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import AdditionalInfoRequired from '../additional-info-required';
import CheckOnboardingRequirements from '../check-onboarding-requirements';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: {
      authToken,
      userFound,
      email,
      sandboxSuffix: identifierSuffix,
      config,
      device,
    },
    collectedKycData,
    requirements: { liveness, idDoc, selfie, kycData, kybData },
  } = state.context;
  const isDone = state.matches('success');

  useLogStateMachine('onboarding-requirements', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  const handleRequirementCompleted = () => {
    send({
      type: 'requirementCompleted',
    });
  };

  if (state.matches('checkOnboardingRequirements')) {
    return <CheckOnboardingRequirements />;
  }
  if (state.matches('additionalInfoRequired')) {
    return (
      <DeviceSignals page="additional-info-required" fpAuthToken={authToken}>
        <AdditionalInfoRequired />
      </DeviceSignals>
    );
  }
  if (state.matches('kybData')) {
    return (
      <DeviceSignals page="kyb-data" fpAuthToken={authToken}>
        <CollectKybData
          context={{
            authToken,
            device,
            customData: {
              missingKybAttributes: kybData,
              missingKycAttributes: kycData,
              config,
              userFound,
              email,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('kycData')) {
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
              sandboxSuffix: identifierSuffix,
              config,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('investorProfile')) {
    return (
      <DeviceSignals page="investor-profile" fpAuthToken={authToken}>
        <InvestorProfile
          context={{
            authToken,
            device,
            customData: {
              showTransition: !!collectedKycData,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('transfer')) {
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
  if (state.matches('idDoc')) {
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

  return null;
};

export default Router;
