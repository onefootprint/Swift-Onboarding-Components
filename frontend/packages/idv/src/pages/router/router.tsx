import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
} from '@onefootprint/idv-elements';
import React, { useEffect } from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import Complete from '../complete';
import getIdentifyBootstrapData from './utils/get-identify-bootstrap-data';

type RouterProps = {
  onDone?: (validationToken?: string) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useIdvMachine();
  const {
    bootstrapData,
    sandboxSuffix,
    authToken,
    userFound,
    isTransfer,
    validationToken,
    obConfigAuth,
    onClose,
    onComplete,
  } = state.context;
  useLogStateMachine('idv', state);
  const isDone = state.matches('complete');
  const identifyBootstrapData = getIdentifyBootstrapData(bootstrapData);

  useEffect(() => {
    if (isDone) {
      onDone?.(validationToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      {state.matches('identify') && obConfigAuth && (
        <Identify
          obConfigAuth={obConfigAuth}
          bootstrapData={identifyBootstrapData}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && authToken && (
        <Onboarding
          authToken={authToken}
          userFound={userFound}
          bootstrapData={bootstrapData}
          sandboxSuffix={sandboxSuffix}
          isTransfer={isTransfer}
          onClose={onClose}
          onComplete={onComplete}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
      {state.matches('complete') && !isTransfer && <Complete />}
    </AppErrorBoundary>
  );
};

export default Router;
