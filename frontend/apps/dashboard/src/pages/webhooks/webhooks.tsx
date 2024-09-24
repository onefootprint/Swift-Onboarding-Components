import { getErrorMessage } from '@onefootprint/request';
import { Box, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import useFakeSpinnerTimeout from './hooks/use-fake-spinner-timeout';
import useWebhookPortal from './hooks/use-webhooks-portal';

const Webhooks = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.webhooks' });
  const { data, error, isPending } = useWebhookPortal();
  const showSpinner = useFakeSpinnerTimeout();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box aria-busy={isPending}>
        <Stack direction="column" gap={2} marginBottom={7}>
          <Text variant="heading-2">{t('header.title')}</Text>
          <Text variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Text>
        </Stack>
        <Box display={showSpinner ? 'none' : 'block'}>
          {data && <Content data={data} />}
          {error && <ErrorComponent message={getErrorMessage(error)} />}
          {isPending && <Loading />}
        </Box>
        {showSpinner && <Loading />}
      </Box>
    </>
  );
};

export default Webhooks;
