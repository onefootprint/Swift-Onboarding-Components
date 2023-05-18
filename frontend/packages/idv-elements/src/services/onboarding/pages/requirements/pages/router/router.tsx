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
      sandboxSuffix,
      bootstrapData,
      config,
      device,
    },
    collectedKycData,
    requirements: { kyb, kyc, liveness, idDoc },
  } = state.context;
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
              sandboxSuffix,
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
  if (state.matches('idDoc') && idDoc) {
    return (
      <DeviceSignals page="id-doc" fpAuthToken={authToken}>
        <IdDoc
          context={{
            authToken,
            device,
            customData: {
              requirement: idDoc,
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

  return null;
};

export default Router;
