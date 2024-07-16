import { Container, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';

import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

const Expired = () => {
  const { t } = useTranslation('screens.expired');
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.track(Events.FEnded, { result: 'expired' });
  }, []);

  return (
    <Container center>
      <Typography variant="heading-3" marginBottom={3} marginTop={4}>
        {t('title')}
      </Typography>
      <Typography variant="body-3" marginBottom={9} center>
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

export default Expired;
