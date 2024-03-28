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
import Error from '../../../../components/error';
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
    onboardingContext: {
      authToken,
      bootstrapData,
      config,
      device,
      idDocOutcome,
      isTransfer,
      isInIframe,
    },
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

  useEffect(() => {
    if (state.value === 'kycData' && collectedKycData) {
      Logger.error(`User is stuck on collecting KYC data`, 'requirements');
    }
  }, [collectedKycData, state.value]);

  const handleRequirementCompleted = () => {
    send({
      type: 'requirementCompleted',
    });
  };

  if (state.matches('startOnboarding')) {
    return <StartOnboarding />;
  }
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
            isInIframe: !!isInIframe,
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
          customData: {
            isInIframe: !!isInIframe,
          },
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
            orgId,
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
  if (state.matches('error')) {
    return <Error />;
  }

  return null;
};

export default Router;
