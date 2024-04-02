import { getRequirement, OnboardingRequirementKind } from '@onefootprint/types';
import { getRequirements } from '@onefootprint/types/src/api/onboarding-status';
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
import Error from '../../../../components/error';
import WaitForComponentsSdk from '../../components/wait-for-components-sdk';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import Authorize from '../authorize';
import CheckRequirements from '../check-requirements';
import Process from '../process';
import StartOnboarding from '../start-onboarding';
import getKycBootstrapData from './utils/get-kyc-bootstrap-data';

type RouterProps = {
  onDone: () => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    idvContext,
    onboardingContext: { bootstrapData, config, idDocOutcome },
    collectedKycData,
    requirements,
  } = state.context;
  const { orgId } = config;
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
  const idDocReqs = getRequirements(
    requirements,
    OnboardingRequirementKind.idDoc,
  );
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

  if (state.matches('startOnboarding')) {
    return <StartOnboarding />;
  }
  if (state.matches('waitForComponentsSdk')) {
    return <WaitForComponentsSdk onDone={handleRequirementCompleted} />;
  }
  if (state.matches('checkRequirements')) {
    return <CheckRequirements />;
  }
  if (state.matches('kybData') && kyb) {
    return (
      <CollectKybData
        idvContext={idvContext}
        context={{
          kybRequirement: kyb,
          kycRequirement: kyc,
          kycBootstrapData,
          config,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('kycData') && kyc) {
    return (
      <CollectKycData
        idvContext={idvContext}
        context={{
          requirement: kyc,
          bootstrapData: kycBootstrapData,
          config,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('investorProfile')) {
    return (
      <InvestorProfile
        idvContext={idvContext}
        context={{
          showTransition: !!collectedKycData,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('transfer')) {
    return (
      <Transfer
        idvContext={idvContext}
        context={{
          config,
          missingRequirements: {
            liveness,
            documents: idDocReqs,
          },
          idDocOutcome,
        }}
        onDone={handleRequirementCompleted}
      />
    );
  }
  if (state.matches('liveness')) {
    return (
      <Liveness idvContext={idvContext} onDone={handleRequirementCompleted} />
    );
  }
  if (state.matches('idDoc') && idDocReqs.length) {
    return (
      <IdDoc
        idvContext={idvContext}
        context={{
          requirement: idDocReqs[0],
          sandboxOutcome: idDocOutcome,
          orgId,
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
  if (state.matches('error')) {
    return <Error />;
  }

  return null;
};

export default Router;
