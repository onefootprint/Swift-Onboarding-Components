import type { L10n } from '@onefootprint/footprint-js';
import { getErrorMessage } from '@onefootprint/request';
import { SessionStatus } from '@onefootprint/types';
import React, { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { AppErrorBoundary, SessionExpired } from '../../components';
import { Identify, IdentifyVariant } from '../../components/identify';
import { L10nContextProvider } from '../../components/l10n-provider';
import { useIdvMachine, useLogStateMachine } from '../../hooks';
import useValidateSession from '../../hooks/ui/use-validate-session';
import { FPCustomEvents, Logger } from '../../utils';
import {
  createAuthTokenChangedPayload,
  createReceivedDeviceResponseJsonPayload,
} from '../../utils/state-machine/utils/custom-listener';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import Onboarding from '../onboarding';
import SandboxOutcome from '../sandbox-outcome';

const Router = ({ l10n }: { l10n?: L10n }) => {
  const [state, send] = useIdvMachine();
  useLogStateMachine('idv', state);
  const {
    config,
    device,
    authToken,
    bootstrapData,
    isTransfer,
    showLogo,
    validationToken,
    obConfigAuth,
    idDocOutcome,
    overallOutcome,
    sandboxId,
    onClose,
    onComplete,
    deviceResponseJson,
  } = state.context;
  const isDone = state.matches('complete');

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
      onComplete?.({});
      return;
    }

    onComplete?.({ validationToken, authToken, deviceResponseJson });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  useEffectOnce(() => {
    const authTokenListener = (e: Event) => {
      const payload = createAuthTokenChangedPayload(e);
      if (payload) send(payload);
    };
    const deviceResponseJsonListener = (e: Event) => {
      const payload = createReceivedDeviceResponseJsonPayload(e);
      if (payload) send(payload);
    };

    document.addEventListener(
      FPCustomEvents.stepUpCompleted,
      authTokenListener,
    );
    document.addEventListener(
      FPCustomEvents.receivedDeviceResponseJson,
      deviceResponseJsonListener,
    );

    return function cleanup() {
      document.removeEventListener(
        FPCustomEvents.stepUpCompleted,
        authTokenListener,
      );
      document.removeEventListener(
        FPCustomEvents.receivedDeviceResponseJson,
        deviceResponseJsonListener,
      );
    };
  });

  return (
    <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
      {state.matches('init') && <Init />}
      {state.matches('sandboxOutcome') && <SandboxOutcome />}
      {state.matches('identify') && config && device && (
        <L10nContextProvider l10n={l10n}>
          <Identify
            variant={IdentifyVariant.verify}
            device={device}
            config={config}
            isLive={config.isLive}
            overallOutcome={overallOutcome}
            sandboxId={sandboxId}
            initialAuthToken={authToken}
            obConfigAuth={obConfigAuth}
            userData={bootstrapData}
            logoConfig={
              (showLogo && {
                orgName: config.orgName,
                logoUrl: config.logoUrl || undefined,
              }) ||
              undefined
            }
            onDone={payload => send({ type: 'identifyCompleted', payload })}
          />
        </L10nContextProvider>
      )}
      {state.matches('onboarding') && authToken && config && device && (
        <Onboarding
          config={config}
          device={device}
          authToken={authToken}
          bootstrapData={bootstrapData}
          isTransfer={isTransfer}
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onClose={onClose}
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
    </AppErrorBoundary>
  );
};

export default Router;
