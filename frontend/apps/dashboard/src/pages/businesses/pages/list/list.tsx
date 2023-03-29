import { useTranslation } from '@onefootprint/hooks';
import { EntityKind } from '@onefootprint/types';
import { Pagination, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import Table from './components/table';
import useEntities from './hooks/use-entities';

const List = () => {
  const { t } = useTranslation('pages.businesses');
  const {
    data: response,
    isLoading,
    errorMessage,
    pagination,
  } = useEntities(EntityKind.business);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <Table
        entities={response?.data}
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

export default List;
