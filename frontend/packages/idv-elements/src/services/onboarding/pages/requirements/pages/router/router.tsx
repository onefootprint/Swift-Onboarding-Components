import { useLogStateMachine } from '@onefootprint/dev-tools';
import React, { useEffect } from 'react';

import DeviceSignals from '../../../../../../components/device-signals';
import {
  CollectKybData,
  CollectKycData,
  IdDoc,
  InvestorProfile,
  Liveness,
  Transfer,
} from '../../../../../../plugins';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import AdditionalInfoRequired from '../additional-info-required';
import Authorize from '../authorize';
import CheckRequirements from '../check-requirements';

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
      sandboxSuffix,
      phoneNumber,
      config,
      device,
    },
    collectedKycData,
    requirements: {
      liveness,
      idDoc,
      selfie,
      consent,
      kycData,
      kybData,
      authorize,
    },
  } = state.context;
  const isDone = state.matches('success');

  useLogStateMachine('onboarding-requirements', state);

  useEffect(() => {
    if (isDone) {
      onDone();
    }
  }, [isDone, onDone]);

  const handleRequirementCompleted = () => {
    send({
      type: 'requirementCompleted',
    });
  };

  if (state.matches('checkRequirements')) {
    return <CheckRequirements />;
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
              phoneNumber,
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
              sandboxSuffix,
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
  if (state.matches('liveness')) {
    return (
      <DeviceSignals page="liveness" fpAuthToken={authToken}>
        <Liveness
          context={{
            authToken,
            device,
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
              shouldCollectConsent: consent,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('authorize')) {
    if (!authorize) {
      return null;
    }
    return (
      <DeviceSignals page="authorize" fpAuthToken={authToken}>
        <Authorize onDone={handleRequirementCompleted} />
      </DeviceSignals>
    );
  }

  return null;
};

export default Router;
