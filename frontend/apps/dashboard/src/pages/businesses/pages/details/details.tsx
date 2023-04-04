import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Content from './components/content';
import Error from './components/error';
import Loading from './components/loading';
import useCurrentEntity from './hooks/use-current-entity';

const Details = () => {
  const { t } = useTranslation('pages.business');
  const { isLoading, errorMessage, data } = useCurrentEntity();

  return (
    <>
      <Head>{t('page-title')}</Head>
      <Box>
        {isLoading && <Loading />}
        {errorMessage && <Error message={errorMessage} />}
        {data && <Content />}
      </Box>
    </>
  );
};

export default Details;
