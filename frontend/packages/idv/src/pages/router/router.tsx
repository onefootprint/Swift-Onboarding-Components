import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
  SessionExpired,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import { SessionStatus } from '@onefootprint/types';
import React, { useEffect } from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import useValidateSession from '../../hooks/use-validate-session';
import Complete from '../complete';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import SandboxOutcome from '../sandbox-outcome';
import getIdentifyBootstrapData from './utils/get-identify-bootstrap-data';

const AUTO_CLOSE_DELAY = 6000;

const Router = () => {
  const [state, send] = useIdvMachine();
  useLogStateMachine('idv', state);
  const {
    config,
    device,
    authToken,
    bootstrapData,
    userFound,
    isTransfer,
    showCompletionPage,
    showLogo,
    validationToken,
    obConfigAuth,
    idDocOutcome,
    sandboxId,
    onClose,
    onComplete,
  } = state.context;
  const isDone = state.matches('complete');
  const shouldShowComplete =
    state.matches('complete') && !isTransfer && showCompletionPage;

  useValidateSession(
    { authToken },
    {
      onSuccess: sessionStatus => {
        if (sessionStatus !== SessionStatus.active) {
          send({
            type: 'expireSession',
          });
        }
      },
      onError: error => {
        console.warn(
          'Validating user session failed with error: ',
          getErrorMessage(error),
        );
      },
    },
  );

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
      {state.matches('init') && <Init />}
      {state.matches('sandboxOutcome') && <SandboxOutcome />}
      {state.matches('identify') && config && device && (
        <Identify
          config={config}
          device={device}
          sandboxId={sandboxId}
          initialAuthToken={authToken}
          obConfigAuth={obConfigAuth}
          bootstrapData={getIdentifyBootstrapData(bootstrapData)}
          showLogo={showLogo}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && authToken && config && device && (
        <Onboarding
          config={config}
          device={device}
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
      {state.matches('sessionExpired') && (
        <SessionExpired
          onRestart={() => {
            send({ type: 'reset' });
          }}
        />
      )}
      {state.matches('configInvalid') && <ConfigInvalid />}
      {shouldShowComplete && <Complete />}
    </AppErrorBoundary>
  );
};

export default Router;
