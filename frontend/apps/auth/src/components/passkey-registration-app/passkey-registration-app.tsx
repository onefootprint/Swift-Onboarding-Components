'use client';

import ModalLoading from '@/src/components/client-loading/modal-loading';
import type { Variant } from '@/src/types';
import { isEmbeddedInIframe } from '@/src/utils';
import { getWindowUrl } from '@onefootprint/core';
import { getSessionIdFromQueryParam } from '@onefootprint/dev-tools';
import { isValidTokenFormat } from '@onefootprint/idv';
import type { DeviceInfo } from '@onefootprint/idv';
import {
  Liveness,
  Logger,
  NavigationHeader,
  getLogger,
  getSdkArgsToken,
  useDeviceInfo,
  useGetD2PStatus,
  useUpdateD2PStatus,
} from '@onefootprint/idv';
import { D2PStatus, D2PStatusUpdate } from '@onefootprint/types';
import { type GetD2PResponse, type PublicOnboardingConfig, UserChallengeActionKind } from '@onefootprint/types';
import { useEffect, useRef, useState } from 'react';

import { Box } from '@onefootprint/ui';
import once from 'lodash/once';
import Layout from '../client-layout';
import NoWebauthnSupport from '../no-webauthn-support';
import PasskeyCancelled from '../passkey-cancelled';
import PasskeyError from '../passkey-error';
import PasskeySuccess from '../passkey-success';
import SessionExpired from '../session-expired';

type PasskeyRegistrationAppProps = { variant?: Variant | null };
type State = 'canceled' | 'completed' | 'done' | 'error' | 'expired' | 'init' | 'inProgress' | 'noWebauthnSupport';

const isTestEnv = process.env.NODE_ENV === 'test';
const EmptyConfig = {} as PublicOnboardingConfig;

const isInIframe = isTestEnv ? false : isEmbeddedInIframe();
const urlFragmentToken = () => {
  if (isInIframe) {
    return '';
  }
  return getSdkArgsToken(getWindowUrl().split('#')[1]) ?? '';
};

const { logError } = getLogger({ location: 'register-passkey-app' });

const startLogger = ({ meta }: GetD2PResponse) => {
  Logger.identify({
    fp_session_id: getSessionIdFromQueryParam() || String(meta?.sessionId),
    l10n: JSON.stringify(meta?.l10n),
    opener: String(meta?.opener),
    redirectUrl: String(meta?.redirectUrl),
  });
  Logger.startSessionReplay();
};

const startLoggerOnce = once(startLogger);

const PasskeyRegistrationApp = ({ variant }: PasskeyRegistrationAppProps): JSX.Element | null => {
  const authToken = urlFragmentToken();
  const [state, setState] = useState<State>('init');
  const [device, setDevice] = useState<DeviceInfo | undefined>(undefined);

  const updateD2PStatusMutation = useUpdateD2PStatus();
  const d2dStatus = useRef<D2PStatus | undefined>();
  const isDone = state === 'done';

  useDeviceInfo(
    device => setDevice(device),
    error => logError('Unable to collect device info', error),
  );

  useGetD2PStatus({
    enabled:
      !isDone &&
      isValidTokenFormat(authToken) &&
      d2dStatus.current !== D2PStatus.canceled &&
      d2dStatus.current !== D2PStatus.completed,
    authToken,
    options: {
      onSuccess: (data: GetD2PResponse) => {
        if (isDone || d2dStatus.current === D2PStatus.canceled || d2dStatus.current === D2PStatus.completed) return;

        d2dStatus.current = data.status;
        startLoggerOnce(data);

        if (data.status === D2PStatus.inProgress) {
          setState('inProgress');
        } else if (data.status === D2PStatus.completed) {
          setState('completed');
        } else if (data.status === D2PStatus.canceled) {
          setState('canceled');
        } else if (data.status === D2PStatus.failed) {
          setState('expired');
        }
      },
      onError: error => {
        logError('Fetching d2p status failed with error, likely indicating expired session:', error);
        if (!isDone) {
          setState('error');
        }
      },
    },
  });

  useEffect(() => {
    if (!isValidTokenFormat(authToken)) {
      logError('Invalid token format');
      setState('error');
      return;
    }

    if (!authToken) return;
    if (!d2dStatus.current) return;

    if (state === 'init' && d2dStatus.current === D2PStatus.waiting) {
      return updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.inProgress,
      });
    }

    if (
      state === 'completed' &&
      (d2dStatus.current === D2PStatus.waiting || d2dStatus.current === D2PStatus.inProgress)
    ) {
      return updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.completed,
      });
    }

    if (state === 'canceled') {
      return updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.canceled,
      });
    }
  }, [authToken, d2dStatus.current, state]);

  useEffect(() => {
    if (device?.hasSupportForWebauthn === false && state !== 'noWebauthnSupport') {
      setState('noWebauthnSupport');
    }
  }, [device?.hasSupportForWebauthn]);

  if (isDone) return null;

  if (state === 'init') return <ModalLoading />;

  return (
    <Layout config={EmptyConfig} variant={variant || undefined}>
      <Box height="56px" />
      {state === 'inProgress' && authToken && device ? (
        <>
          <NavigationHeader leftButton={{ variant: 'close' }} />
          <Liveness
            actionKind={UserChallengeActionKind.addPrimary}
            idvContext={{ authToken, device, isInIframe }}
            onCustomSkip={() => setState('canceled')}
            onDone={() => setState('completed')}
          />
        </>
      ) : null}
      {state === 'completed' ? <PasskeySuccess /> : null}
      {state === 'canceled' ? <PasskeyCancelled /> : null}
      {state === 'expired' ? <SessionExpired /> : null}
      {state === 'error' ? <PasskeyError /> : null}
      {state === 'noWebauthnSupport' ? <NoWebauthnSupport /> : null}
    </Layout>
  );
};

export default PasskeyRegistrationApp;
