import type { L10n } from '@onefootprint/footprint-js';
import { IdDI, SessionStatus } from '@onefootprint/types';
import { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import GenericErrorPage from '../../../src/components/gerenic-error-page/generic-error-page';
import { IDV_SESSION_RETRY_LIMIT } from '../../../src/config/constants';
import { AppErrorBoundary, SessionExpired } from '../../components';
import { Identify, IdentifyVariant } from '../../components/identify';
import { L10nContextProvider } from '../../components/l10n-provider';
import LoadNeuroId from '../../components/load-neuro-id';
import { useIdvMachine, useLogStateMachine } from '../../hooks';
import { useValidateSession } from '../../queries';
import { FPCustomEvents, getLogger, trackAction } from '../../utils';
import {
  createAuthTokenChangedPayload,
  createReceivedDeviceResponseJsonPayload,
} from '../../utils/state-machine/utils/custom-listener';
import ConfigInvalid from '../config-invalid';
import Init from '../init';
import Onboarding from '../onboarding';
import SandboxOutcome from '../sandbox-outcome';

type RouterProps = {
  l10n?: L10n;
  onIdentifyDone?: ({ authToken }: { authToken: string }) => void;
};

const { receivedDeviceResponseJson, stepUpCompleted } = FPCustomEvents;
const { logWarn } = getLogger({ location: 'idv-router' });

const Router = ({ l10n, onIdentifyDone }: RouterProps) => {
  const [state, send] = useIdvMachine();
  useLogStateMachine('idv', state);
  const {
    config,
    device,
    authToken,
    bootstrapData,
    isTransfer,
    componentsSdkContext,
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
    retries,
  } = state.context;
  console.log('idv state.context', state.context);
  const isDone = state.matches('complete');
  const retryLimitExceeded = retries > IDV_SESSION_RETRY_LIMIT;

  useValidateSession(
    { authToken },
    {
      onSuccess: sessionStatus => {
        if (sessionStatus !== SessionStatus.active) {
          send({ type: 'expireSession' });
          trackAction('expired:check_session');
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
  }, [authToken, deviceResponseJson, isDone, isTransfer, onComplete, validationToken]);

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
    document.addEventListener(receivedDeviceResponseJson, deviceResponseJsonListener);

    return function cleanup() {
      document.removeEventListener(stepUpCompleted, authTokenListener);
      document.removeEventListener(receivedDeviceResponseJson, deviceResponseJsonListener);
    };
  });

  return (
    <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
      {!isTransfer && <LoadNeuroId config={config} />}
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
            isComponentsSdk={!!componentsSdkContext}
            bootstrapData={{
              email: bootstrapData?.[IdDI.email]?.value,
              phoneNumber: bootstrapData?.[IdDI.phoneNumber]?.value,
            }}
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

              trackAction('identify:completed');
            }}
          />
        </L10nContextProvider>
      ) : null}
      {state.matches('onboarding') && authToken && config && device ? (
        <Onboarding
          config={config}
          idvContext={{
            device,
            authToken,
            isTransfer,
            componentsSdkContext,
            isInIframe,
          }}
          bootstrapData={bootstrapData}
          overallOutcome={overallOutcome}
          idDocOutcome={idDocOutcome}
          onClose={onClose}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
            trackAction('onboarding:completed');
          }}
          l10n={l10n}
        />
      ) : null}
      {state.matches('sessionExpired') ? (
        <SessionExpired onRestart={() => send({ type: 'reset' })} retryLimitExceeded={retryLimitExceeded} />
      ) : null}
      {state.matches('initConfigFailed') ? (
        <GenericErrorPage onRetry={() => send({ type: 'reset' })} retryLimitExceeded={retryLimitExceeded} />
      ) : null}
      {state.matches('configInvalid') ? <ConfigInvalid /> : null}
    </AppErrorBoundary>
  );
};

export default Router;
