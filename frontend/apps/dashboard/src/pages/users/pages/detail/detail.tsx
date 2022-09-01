import { useTranslation } from 'hooks';
import partial from 'lodash/partial';
import Head from 'next/head';
import React from 'react';
import UserHeader from 'src/pages/users/pages/detail/components/user-header';
import styled, { css } from 'styled-components';
import { Box, Divider, Typography } from 'ui';

import useGetUsers from '../../hooks/use-get-users';
import AuditTrail from './components/audit-trail';
import BasicInfo from './components/basic-info';
import Insights from './components/insights';

const Detail = () => {
  const { t } = useTranslation('pages.user-details');
  const { users, loadEncryptedAttributes } = useGetUsers(1);
  // TODO error handling when this data is empty
  // https://linear.app/footprint/issue/FP-202
  const user = users?.[0]!;

  // TODO: replace with breadcrumb component
  // https://linear.app/footprint/issue/FP-211/component-breadcrumb
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
      {user && (
        <>
          <UserHeader
            user={user}
            onDecrypt={partial(loadEncryptedAttributes, user.footprintUserId)}
          />
          <Box sx={{ marginTop: 5, marginBottom: 5 }}>
            <Divider />
          </Box>
          <BasicInfo user={user} />
          <Box sx={{ height: '40px' }}>&nbsp;</Box>
          {user.isPortable ? <AuditTrail user={user} /> : null}
          <Box sx={{ height: '40px' }}>&nbsp;</Box>
          {user.isPortable ? <Insights user={user} /> : null}
          <Box sx={{ height: '72px' }}>&nbsp;</Box>
        </>
      )}
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
