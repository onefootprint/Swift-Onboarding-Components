import { D2PStatusUpdate } from '@onefootprint/types';
import { Container, LoadingIndicator } from '@onefootprint/ui';
import React, { useEffect } from 'react';

import { AnalyticsTimeEvents, Events, useAnalytics } from '@/utils/analytics';

import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';

export type InitProps = {
  authToken: string;
  onError: () => void;
  onSuccess: () => void;
};

const Init = ({ authToken, onSuccess, onError }) => {
  const analytics = useAnalytics();
  const updateD2PStatusMutation = useUpdateD2PStatus();

  useEffect(() => {
    if (!authToken) return;
    analytics.track(Events.Started);
    analytics.timeEvent(AnalyticsTimeEvents.handoff);

    updateD2PStatusMutation.mutate(
      { authToken, status: D2PStatusUpdate.inProgress },
      {
        onSuccess: () => {
          onSuccess(authToken);
        },
        onError,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  return (
    <Container center>
      <LoadingIndicator />
    </Container>
  );
};

export default Init;
