import { useTranslation } from '@onefootprint/hooks';
import { Pagination, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Table from './components/table';
import useBusinesses from './hooks/use-businesses';

const Businesses = () => {
  const { t } = useTranslation('pages.businesses');
  const {
    data: response,
    isLoading,
    errorMessage,
    pagination,
  } = useBusinesses();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <Table
        businesses={response?.data}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
      {response && response.meta.count > 0 && (
        <Pagination
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onNextPage={pagination.loadNextPage}
          onPrevPage={pagination.loadPrevPage}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalNumResults={response.meta.count}
        />
      )}
    </>
  );
};

export default Businesses;
