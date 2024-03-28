import type { L10n } from '@onefootprint/footprint-js';
import { SessionStatus } from '@onefootprint/types';
import type { ComponentProps } from 'react';
import React, { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { AppErrorBoundary, SessionExpired } from '../../components';
import { Identify, IdentifyVariant } from '../../components/identify';
import { L10nContextProvider } from '../../components/l10n-provider';
import {
  useIdvMachine,
  useLogStateMachine,
  useValidateSession,
} from '../../hooks';
import { FPCustomEvents, getLogger } from '../../utils';
import {
  createAuthTokenChangedPayload,
  createReceivedDeviceResponseJsonPayload,
} from '../../utils/state-machine/utils/custom-listener';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import Onboarding from '../onboarding';
import SandboxOutcome from '../sandbox-outcome';

type IdentifyProps = ComponentProps<typeof Identify>;
type RouterProps = { l10n?: L10n; onIdentifyDone?: IdentifyProps['onDone'] };

const { receivedDeviceResponseJson, stepUpCompleted } = FPCustomEvents;
const { logWarn } = getLogger('idv-router');

const Router = ({ l10n, onIdentifyDone }: RouterProps) => {
  const [state, send] = useIdvMachine();
  useLogStateMachine('idv', state);
  const {
    config,
    device,
    authToken,
    bootstrapData,
    isTransfer,
    isComponentsSdk,
    isInIframe,
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
        logWarn('Validating user session failed with error: ', error);
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
  }, [
    authToken,
    deviceResponseJson,
    isDone,
    isTransfer,
    onComplete,
    validationToken,
  ]);

  useEffectOnce(() => {
    const authTokenListener = (e: Event) => {
      const payload = createAuthTokenChangedPayload(e);
      if (payload) send(payload);
    };
    const deviceResponseJsonListener = (e: Event) => {
      const payload = createReceivedDeviceResponseJsonPayload(e);
      if (payload) send(payload);
    };

    document.addEventListener(stepUpCompleted, authTokenListener);
    document.addEventListener(
      receivedDeviceResponseJson,
      deviceResponseJsonListener,
    );

    return function cleanup() {
      document.removeEventListener(stepUpCompleted, authTokenListener);
      document.removeEventListener(
        receivedDeviceResponseJson,
        deviceResponseJsonListener,
      );
    };
  });

  return (
    <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
      {state.matches('init') ? <Init /> : null}
      {state.matches('sandboxOutcome') ? <SandboxOutcome /> : null}
      {state.matches('identify') && config && device ? (
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
              showLogo
                ? {
                    orgName: config.orgName,
                    logoUrl: config.logoUrl || undefined,
                  }
                : undefined
            }
            onDone={payload => {
              send({ type: 'identifyCompleted', payload });
              if (onIdentifyDone && payload) {
                onIdentifyDone(payload);
              }
            }}
          />
        </L10nContextProvider>
      ) : null}
      {state.matches('onboarding') && authToken && config && device ? (
        <Onboarding
          config={config}
          device={device}
          authToken={authToken}
          bootstrapData={bootstrapData}
          isTransfer={isTransfer}
          isComponentsSdk={isComponentsSdk}
          isInIframe={isInIframe}
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onClose={onClose}
          onDone={payload => send({ type: 'onboardingCompleted', payload })}
          l10n={l10n}
        />
      ) : null}
      {state.matches('sessionExpired') ? (
        <SessionExpired onRestart={() => send({ type: 'reset' })} />
      ) : null}
      {state.matches('configInvalid') ? <ConfigInvalid /> : null}
    </AppErrorBoundary>
  );
};

export default Router;
