import { IcoCheckCircle40 } from '@onefootprint/icons';
import { D2PStatusUpdate } from '@onefootprint/types';
import { Container, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';

import useTranslation from '@/hooks/use-translation';
import { AnalyticsTimeEvents, Events, useAnalytics } from '@/utils/analytics';

import useUpdateD2PStatus from '../../hooks/use-update-d2p-status';

const Completed = ({ authToken }) => {
  const { t } = useTranslation('screens.completed');
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.track(Events.FEnded, { result: 'success' });
    analytics.timeEvent(AnalyticsTimeEvents.handoff);

    updateD2PStatusMutation.mutate({
      authToken,
      status: D2PStatusUpdate.completed,
    });
  }, []);

  return (
    <Container center>
      <IcoCheckCircle40 color="success" />
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" center>
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

export default Completed;
