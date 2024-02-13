import { getRequirement, OnboardingRequirementKind } from '@onefootprint/types';
import React, { useEffect } from 'react';

import useLogStateMachine from '../../../../../../hooks/ui/use-log-state-machine';
import {
  CollectKybData,
  CollectKycData,
  IdDoc,
  InvestorProfile,
  Liveness,
  Transfer,
} from '../../../../../../plugins';
import Logger from '../../../../../../utils/logger';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
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
      bootstrapData,
      config,
      device,
      idDocOutcome,
      isTransfer,
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
      Logger.info('Onboarding requirements flow is complete');
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
  if (state.matches('kybData') && kyb) {
    return (
      <CollectKybData
        context={{
          authToken,
          device,
          customData: {
            kybRequirement: kyb,
            kycRequirement: kyc,
            kycBootstrapData,
            config,
          },
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('kycData') && kyc) {
    return (
      <CollectKycData
        context={{
          authToken,
          device,
          customData: {
            requirement: kyc,
            bootstrapData: kycBootstrapData,
            config,
          },
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('investorProfile')) {
    return (
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
    );
  }
  if (state.matches('transfer')) {
    return (
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
    );
  }
  if (state.matches('liveness')) {
    return (
      <Liveness
        context={{
          isTransfer,
          authToken,
          device,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('idDoc') && idDoc) {
    return (
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
    );
  }
  if (state.matches('authorize')) {
    return <Authorize onDone={handleRequirementCompleted} />;
  }
  if (state.matches('process')) {
    return <Process onDone={handleRequirementCompleted} />;
  }

  return null;
};

export default Router;
