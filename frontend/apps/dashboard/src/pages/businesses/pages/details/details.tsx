import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useBusiness from './hooks/use-business';

const Details = () => {
  const { t } = useTranslation('pages.business');
  const { errorMessage, isLoading, data } = useBusiness();

  return (
    <>
      <Head>{t('title')}</Head>
      <Box>
        {isLoading && <Loading />}
        {errorMessage && <Error />}
        {data && <Content />}
      </Box>
    </>
  );
};

export default Details;
