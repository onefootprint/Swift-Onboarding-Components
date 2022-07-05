import { partial } from 'lodash';
import React from 'react';
import UserHeader from 'src/pages/users/pages/detail/components/user-header';
import styled, { css } from 'styled-components';
import { Box, Divider, Typography } from 'ui';

import useGetUsers from '../../hooks/use-get-users';
import AuditTrail from './components/audit-trail';
import BasicInfo from './components/basic-info';
import Insights from './components/insights';

const Detail = () => {
  const { users, loadEncryptedAttributes } = useGetUsers(1);
  // TODO error handling when this data is empty
  // https://linear.app/footprint/issue/FP-202
  const user = users?.[0]!;

  return (
    <>
      {/* TODO: replace with breadcrumb component
       https://linear.app/footprint/issue/FP-211/component-breadcrumb */}
      <HeaderContainer>
        <Typography
          variant="label-2"
          color="tertiary"
          sx={{ userSelect: 'none' }}
        >
          Users /&nbsp;
        </Typography>
        <Typography variant="label-2" sx={{ userSelect: 'none' }}>
          Details
        </Typography>
      </HeaderContainer>
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
          <AuditTrail user={user} />
          <Box sx={{ height: '40px' }}>&nbsp;</Box>
          <Insights user={user} />
          <Box sx={{ height: '72px' }}>&nbsp;</Box>
        </>
      )}
    </>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
    display: flex;
    flex-direction: row;
  `};
`;

export default Detail;
