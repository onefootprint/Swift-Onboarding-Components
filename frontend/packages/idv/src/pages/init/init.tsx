import { getErrorMessage, useRequestError } from '@onefootprint/request';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import React, { useEffect } from 'react';

import { ConfigRequestFailureReason } from '../../../src/utils/state-machine/types';
import { InitShimmer } from '../../components';
import type { DeviceInfo } from '../../hooks';
import { useDeviceInfo, useGetOnboardingConfig } from '../../hooks';
import useIdvMachine from '../../hooks/ui/use-idv-machine';
import { getLogger, trackAction } from '../../utils';

const { logError, logWarn } = getLogger({ location: 'idv-init' });

const Init = () => {
  const [state, send] = useIdvMachine();
  const { getErrorCode, getErrorStatusCode } = useRequestError();
  const { obConfigAuth, authToken, device, bootstrapData = {} } = state.context;

  useDeviceInfo(
    (info: DeviceInfo) => send({ type: 'initContextUpdated', payload: { device: device ?? info } }),
    () => logWarn('Unable to collect device info'),
  );

  useEffect(() => {
    trackAction('onboarding:started', {
      hasBootstrapData: Object.entries(bootstrapData).some(([, value]) => value),
    });
    // TODO: Deprecate this action
    trackAction('idv:started');
  }, []);

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: (config: PublicOnboardingConfig) => {
        send({
          type: 'initContextUpdated',
          payload: {
            config,
          },
        });
      },
      onError: error => {
        trackAction('onboarding:started-failed', { error: getErrorMessage(error) });
        logError(`Fetching onboarding config in IDV init page failed: ${getErrorMessage(error)}`, error);
        const errorCode = getErrorCode(error);
        const errorStatusCode = getErrorStatusCode(error);
        let reason: ConfigRequestFailureReason = ConfigRequestFailureReason.other;
        if (errorCode === 'E118') {
          reason = ConfigRequestFailureReason.sessionExpired;
        } else if (errorStatusCode === 401 || errorStatusCode === 404) {
          reason = ConfigRequestFailureReason.invalidConfig;
        }
        send({
          type: 'configRequestFailed',
          payload: {
            reason,
          },
        });
      },
    },
  );

  return <InitShimmer />;
};

export default Init;
