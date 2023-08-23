import { useLogStateMachine } from '@onefootprint/dev-tools';
import { getRequirement, OnboardingRequirementKind } from '@onefootprint/types';
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
import Process from '../process';
import getKycBootstrapData from './utils/get-kyc-bootstrap-data';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: {
      authToken,
      userFound,
      bootstrapData,
      config,
      device,
      idDocOutcome,
    },
    collectedKycData,
    requirements,
  } = state.context;
  const kyb = getRequirement(
    requirements,
    OnboardingRequirementKind.collectKybData,
  );
  const kyc = getRequirement(
    requirements,
    OnboardingRequirementKind.collectKycData,
  );
  const liveness = getRequirement(
    requirements,
    OnboardingRequirementKind.registerPasskey,
  );
  const idDoc = getRequirement(requirements, OnboardingRequirementKind.idDoc);
  const isDone = state.matches('success');
  useLogStateMachine('onboarding-requirements', state);
  const kycBootstrapData = getKycBootstrapData(bootstrapData);

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
  if (state.matches('kybData') && kyb) {
    return (
      <DeviceSignals page="kyb-data" fpAuthToken={authToken}>
        <CollectKybData
          context={{
            authToken,
            device,
            customData: {
              kybRequirement: kyb,
              kycRequirement: kyc,
              kycBootstrapData,
              userFound,
              config,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('kycData') && kyc) {
    return (
      <DeviceSignals page="kyc-data" fpAuthToken={authToken}>
        <CollectKycData
          context={{
            authToken,
            device,
            customData: {
              requirement: kyc,
              bootstrapData: kycBootstrapData,
              userFound,
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
              config,
              missingRequirements: {
                liveness,
                idDoc,
              },
              idDocOutcome,
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
  if (state.matches('idDoc') && idDoc) {
    return (
      <DeviceSignals page="id-doc" fpAuthToken={authToken}>
        <IdDoc
          context={{
            authToken,
            device,
            customData: {
              requirement: idDoc,
              sandboxOutcome: idDocOutcome,
            },
          }}
          onDone={handleRequirementCompleted}
        />
      </DeviceSignals>
    );
  }
  if (state.matches('authorize')) {
    return (
      <DeviceSignals page="authorize" fpAuthToken={authToken}>
        <Authorize onDone={handleRequirementCompleted} />
      </DeviceSignals>
    );
  }
  if (state.matches('process')) {
    return (
      <DeviceSignals page="process" fpAuthToken={authToken}>
        <Process onDone={handleRequirementCompleted} />
      </DeviceSignals>
    );
  }

  return null;
};

export default Router;
