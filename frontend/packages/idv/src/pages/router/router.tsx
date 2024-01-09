import type { L10n } from '@onefootprint/footprint-js';
import { getErrorMessage } from '@onefootprint/request';
import { SessionStatus } from '@onefootprint/types';
import React, { useEffect } from 'react';

import { AppErrorBoundary, SessionExpired } from '../../components';
import { useIdvMachine, useLogStateMachine } from '../../hooks';
import useValidateSession from '../../hooks/ui/use-validate-session';
import { FPCustomEvents, getIdentifyBootstrapData, Logger } from '../../utils';
import createAuthTokenChangedPayload from '../../utils/state-machine/utils/custom-listener';
import Complete from '../complete';
import ConfigInvalid from '../config-invalid';
import Identify from '../identify';
import Init from '../init';
import Onboarding from '../onboarding';
import SandboxOutcome from '../sandbox-outcome';

const AUTO_CLOSE_DELAY = 6000;

const Router = ({ l10n }: { l10n?: L10n }) => {
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
    overallOutcome,
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
        Logger.warn(
          `Validating user session failed with error: ${getErrorMessage(
            error,
          )}`,
          'idv-router',
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

  useEffect(() => {
    const listener = (e: Event) => {
      const payload = createAuthTokenChangedPayload(e);
      if (payload) send(payload);
    };

    document.addEventListener(FPCustomEvents.stepUpCompleted, listener);
    return function cleanup() {
      document.removeEventListener(FPCustomEvents.stepUpCompleted, listener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
      {state.matches('init') && <Init />}
      {state.matches('sandboxOutcome') && <SandboxOutcome />}
      {state.matches('identify') && config && device && (
        <Identify
          config={config}
          device={device}
          sandboxId={sandboxId}
          overallOutcome={overallOutcome}
          initialAuthToken={authToken}
          obConfigAuth={obConfigAuth}
          bootstrapData={getIdentifyBootstrapData(bootstrapData)}
          showLogo={showLogo}
          onDone={payload => send({ type: 'identifyCompleted', payload })}
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
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onClose={onClose}
          onComplete={onComplete}
          onDone={payload => send({ type: 'onboardingCompleted', payload })}
          l10n={l10n}
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
