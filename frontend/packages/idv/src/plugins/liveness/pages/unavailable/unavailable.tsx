import { getErrorMessage } from '@onefootprint/request';
import { SkipLivenessClientType, SkipLivenessReason } from '@onefootprint/types/src/api/skip-liveness';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../components';
import { useSkipLiveness } from '../../../../queries';
import { checkIsSocialMediaBrowser } from '../../../../utils';
import { trackAction } from '../../../../utils/logger';
import { Logger } from '../../../../utils/logger';
import useLivenessMachine from '../../hooks/use-liveness-machine';

const Unavailable = () => {
  const [state, send] = useLivenessMachine();
  const {
    idvContext: { authToken, device, isInIframe },
  } = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let reason;
    if (!device?.hasSupportForWebauthn) {
      reason = SkipLivenessReason.unavailableOnDevice;
    } else if (isInIframe) {
      if (checkIsSocialMediaBrowser()) {
        reason = SkipLivenessReason.unavailableInSocialIframe;
      } else {
        reason = SkipLivenessReason.unavailableInIframe;
      }
    } else {
      reason = SkipLivenessReason.unknown;
    }
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
          send({
            type: 'completed',
          });
        },
        onError: (error: unknown) => {
          Logger.error(`Error while skipping liveness in liveness unavailable page: ${getErrorMessage(error)}`, {
            location: 'liveness-unavailable',
          });
        },
      },
    );
  }, []);

  return (
    <Container>
      <NavigationHeader />
      <AnimatedLoadingSpinner animationStart />
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
