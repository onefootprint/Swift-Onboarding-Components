import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useFakeSpinnerTimeout from './hooks/use-fake-spinner-timeout';
import useWebhookPortal from './hooks/use-webhooks-portal';

const Webhooks = () => {
  const { t } = useTranslation('pages.webhooks');
  const { data, error, isLoading } = useWebhookPortal();
  const showSpinner = useFakeSpinnerTimeout();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box aria-busy={isLoading}>
        <Stack direction="column" gap={2} marginBottom={7}>
          <Typography variant="heading-2">{t('header.title')}</Typography>
          <Typography variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Typography>
        </Stack>
        <Box display={showSpinner ? 'none' : 'block'}>
          {data && <Content data={data} />}
          {error && <Error message={getErrorMessage(error)} />}
          {isLoading && <Loading />}
        </Box>
        {showSpinner && <Loading />}
      </Box>
    </>
  );
};

export default Webhooks;
