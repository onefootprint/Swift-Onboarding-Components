import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useEntityInitialData from './hooks/use-entity-initial-data';

const Details = () => {
  const { t } = useTranslation('pages.business');
  const { isLoading, errorMessage, data } = useEntityInitialData();

  return (
    <>
      <Head>{t('page-title')}</Head>
      <Box>
        {isLoading && <Loading />}
        {errorMessage && !isLoading && <Error message={errorMessage} />}
        {data && !isLoading && <Content />}
      </Box>
    </>
  );
};

export default Details;
