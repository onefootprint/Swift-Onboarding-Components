import { useTranslation } from '@onefootprint/hooks';
import { Pagination, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import IntroDialog from './components/intro-dialog';
import UsersTable from './components/users-table/users-table';
import useUsers from './hooks/use-users';

const Users = () => {
  const { t } = useTranslation('pages.users');
  const { data: response, isLoading, pagination } = useUsers();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <UsersTable users={response?.data} isLoading={isLoading} />
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
      <IntroDialog />
    </>
  );
};

export default Users;
