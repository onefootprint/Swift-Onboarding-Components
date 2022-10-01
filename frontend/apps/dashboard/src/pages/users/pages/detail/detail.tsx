import { useTranslation } from '@onefootprint/hooks';
import { Box, Breadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

import useGetUsers from '../../hooks/use-get-users';
import DecryptMachineProvider from './components/decrypt-machine-provider';
import UserDetailsData from './components/user-detail-data';
import UserDetailEmptyState from './components/user-detail-empty-state';
import UserDetailsLoading from './components/user-detail-loading';

const Detail = () => {
  const { t } = useTranslation('pages.user-details');
  const { users, decryptUser, isLoading } = useGetUsers(1);
  const user = users?.[0];
  const shouldShowData = user && !isLoading;
  const shouldShowEmptyState = !user && !isLoading;

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box sx={{ marginBottom: 8 }}>
        <Breadcrumb aria-label={t('breadcrumb.title')}>
          <BreadcrumbItem href="/users" as={Link}>
            {t('breadcrumb.users')}
          </BreadcrumbItem>
          <BreadcrumbItem>{t('breadcrumb.details')}</BreadcrumbItem>
        </Breadcrumb>
      </Box>
      <DecryptMachineProvider>
        {isLoading && <UserDetailsLoading />}
        {shouldShowData && (
          <UserDetailsData user={user} decrypt={decryptUser} />
        )}
        {shouldShowEmptyState && <UserDetailEmptyState />}
      </DecryptMachineProvider>
    </>
  );
};

export default Detail;
