import { Container, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';

import useTranslation from '@/hooks/use-translation';
import { AnalyticsEvents, useAnalytics } from '@/utils/analytics';

const Canceled = () => {
  const { t } = useTranslation('screens.canceled');
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.track(AnalyticsEvents.Ended, { result: 'canceled' });
  }, []);

  return (
    <Container center>
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" center>
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

export default Canceled;
