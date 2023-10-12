import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import WebhooksPortalLoading from './components/loading';
import useWebhookPortal from './hooks/use-webhooks-portal';

const Webhooks = () => {
  const { t } = useTranslation('pages.webhooks');
  const { data, error, isLoading } = useWebhookPortal();

  return (
    <section data-testid="webhooks-section" aria-busy={isLoading}>
      <Stack direction="column" gap={2} marginBottom={7}>
        <Typography variant="heading-2">{t('section-title')}</Typography>
        <Typography variant="body-2" color="secondary">
          {t('header.subtitle')}
        </Typography>
      </Stack>
      {data && <Content data={data} />}
      {error && <Error message={getErrorMessage(error)} />}
      {isLoading && <WebhooksPortalLoading />}
    </section>
  );
};

export default Webhooks;
