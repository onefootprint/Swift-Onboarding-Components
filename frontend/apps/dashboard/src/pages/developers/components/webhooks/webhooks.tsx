import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import Content from './components/content';
import Error from './components/error/error';
import WebhooksPortalLoading from './components/loading/loading';
import useWebhookPortal from './hooks/use-webhooks-portal';

const Webhooks = () => {
  const { t } = useTranslation('pages.developers.webhooks');
  const { data, error, isLoading } = useWebhookPortal();

  return (
    <section data-testid="webhooks-section" aria-busy={isLoading}>
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
      </Header>
      <Box sx={{ marginY: 5 }} />
      {data && <Content data={data} />}
      {error && <Error message={getErrorMessage(error)} />}
      {isLoading && <WebhooksPortalLoading />}
    </section>
  );
};

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export default Webhooks;
