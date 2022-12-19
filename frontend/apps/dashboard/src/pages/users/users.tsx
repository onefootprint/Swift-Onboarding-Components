import { useTranslation } from '@onefootprint/hooks';
import { Pagination, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import useUsersPage from 'src/hooks/use-users-page';

import UsersTable from './components/users-table/users-table';

const PAGE_SIZE = 10;

const Users = () => {
  const { t } = useTranslation('pages.users');
  const {
    users,
    isLoading,
    totalNumUsers,
    pageIndex,
    loadNextPage,
    loadPrevPage,
    hasNextPage,
    hasPrevPage,
  } = useUsersPage(PAGE_SIZE);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <UsersTable users={users} isLoading={isLoading} />
      {totalNumUsers > 0 && (
        <Pagination
          totalNumResults={totalNumUsers}
          pageSize={PAGE_SIZE}
          pageIndex={pageIndex}
          onNextPage={loadNextPage}
          onPrevPage={loadPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}
    </>
  );
};

export default Users;
