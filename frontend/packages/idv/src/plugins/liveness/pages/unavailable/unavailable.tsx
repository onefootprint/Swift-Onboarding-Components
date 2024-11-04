import { getErrorMessage } from '@onefootprint/request';
import { SkipLivenessClientType, SkipLivenessReason } from '@onefootprint/types/src/api/skip-liveness';
import { LoadingSpinner } from '@onefootprint/ui';
import { useEffect } from 'react';
import styled from 'styled-components';

import { getLogger, trackAction } from '@/idv/utils';
import { NavigationHeader } from '../../../../components';
import { useSkipLiveness } from '../../../../queries';
import { checkIsSocialMediaBrowser } from '../../../../utils';
import useLivenessMachine from '../../hooks/use-liveness-machine';

const { logError, logInfo, logWarn } = getLogger({ location: 'passkeys-unavailable' });

const Unavailable = () => {
  const [state, send] = useLivenessMachine();
  const {
    idvContext: { authToken, device, isInIframe },
  } = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffect(() => {
    logInfo('Passkeys unavailable started');
  }, []);

  useEffect(() => {
    if (!authToken) {
      logWarn('Cannot continue as authToken is not defined');
      return;
    }

    let reason = SkipLivenessReason.unknown;
    if (!device?.hasSupportForWebauthn) {
      reason = SkipLivenessReason.unavailableOnDevice;
    } else if (isInIframe) {
      if (checkIsSocialMediaBrowser()) {
        reason = SkipLivenessReason.unavailableInSocialIframe;
      } else {
        reason = SkipLivenessReason.unavailableInIframe;
      }
    }
    logInfo(`Skipping passkeys: ${reason}`);
    trackAction('passkeys:unavailable', { reason });

    const context = {
      reason,
      clientType: SkipLivenessClientType.web,
      numAttempts: 0,
      attempts: [],
    };
    skipLivenessMutation.mutate(
      { authToken, context },
      {
        onSuccess: () => {
          logInfo('Skipped passkeys with success');
          send({ type: 'completed' });
        },
        onError: (error: unknown) => {
          logError(`Error while skipping passkeys: ${getErrorMessage(error)}`, error);
        },
      },
    );
  }, [authToken]);

  return (
    <Container>
      <NavigationHeader />
      <LoadingSpinner />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  min-height: var(--loading-container-min-height);
`;

export default Unavailable;
