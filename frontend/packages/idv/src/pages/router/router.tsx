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

const AUTO_CLOSE_DELAY = 6000;

const Router = () => {
  const [state, send] = useIdvMachine();
  const {
    bootstrapData,
    authToken,
    userFound,
    isTransfer,
    showCompletionPage,
    validationToken,
    obConfigAuth,
    onClose,
    onComplete,
    showLogo,
    idDocOutcome,
  } = state.context;
  useLogStateMachine('idv', state);
  const isDone = state.matches('complete');
  const identifyBootstrapData = getIdentifyBootstrapData(bootstrapData);
  const shouldShowComplete =
    state.matches('complete') && !isTransfer && showCompletionPage;

  useEffect(() => {
    if (!isDone) {
      return;
    }

    if (isTransfer) {
      onComplete?.();
      return;
    }

    if (showCompletionPage) {
      onComplete?.(validationToken, AUTO_CLOSE_DELAY);
      return;
    }

    onComplete?.(validationToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

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
          showLogo={showLogo}
        />
      )}
      {state.matches('onboarding') && authToken && (
        <Onboarding
          authToken={authToken}
          userFound={userFound}
          bootstrapData={bootstrapData}
          isTransfer={isTransfer}
          idDocOutcome={idDocOutcome}
          onClose={onClose}
          onComplete={onComplete}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
      {shouldShowComplete && <Complete />}
    </AppErrorBoundary>
  );
};

export default Router;
