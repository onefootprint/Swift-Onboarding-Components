import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import useGetUsers from '../../hooks/use-get-users';
import UserDetailsData from './components/user-detail-data';
import UserDetailEmptyState from './components/user-detail-empty-state';
import UserDetailsLoading from './components/user-detail-loading';
import DecryptMachineProvider from './utils/decrypt-state-machine';

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
      <Breadcrumb>
        <Typography variant="label-2" color="tertiary">
          {t('breadcrumb.users')}&nbsp;
        </Typography>
        <Typography variant="label-2">{t('breadcrumb.details')}</Typography>
      </Breadcrumb>
      <DecryptMachineProvider>
        {isLoading ?? <UserDetailsLoading />}
        {shouldShowData && (
          <UserDetailsData user={user} decrypt={decryptUser} />
        )}
        {shouldShowEmptyState && <UserDetailEmptyState />}
      </DecryptMachineProvider>
    </>
  );
};

const Breadcrumb = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    margin-bottom: ${theme.spacing[7]}px;
  `};
`;

export default Detail;
