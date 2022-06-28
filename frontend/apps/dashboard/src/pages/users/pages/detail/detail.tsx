import IcoBuilding16 from 'icons/ico/ico-building-16';
import IcoCheck16 from 'icons/ico/ico-check-16';
import IcoFootprint16 from 'icons/ico/ico-footprint-16';
import IcoUserCircle16 from 'icons/ico/ico-user-circle-16';
import { partial } from 'lodash';
import React from 'react';
import FieldTag from 'src/components/field-tag';
import Timeline from 'src/components/timeline';
import UserHeader from 'src/pages/users/pages/detail/components/user-header';
import { DataKind } from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Divider, Typography } from 'ui';

import useGetUsers from '../../hooks/use-get-users';
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
          <Typography variant="heading-3" sx={{ userSelect: 'none' }}>
            Audit trail
          </Typography>
          <Box sx={{ marginTop: 5, marginBottom: 5 }}>
            <Divider />
          </Box>
          <Timeline
            items={[
              {
                timestamp: '2022-06-02 22:24:41',
                iconComponent: <IcoCheck16 />,
                headerComponent: (
                  <Typography variant="label-3">
                    Liveness checks succeeded
                  </Typography>
                ),
                bodyComponent: (
                  <>
                    <Typography variant="body-3" color="secondary">
                      •{'    '}Attested by Apple & Footprint
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •{'    '}iPhone 13 Pro Max, iOS 15.5
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •{'    '}34.36.156.118 (IP address)
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •{'    '}San Francisco, California
                    </Typography>
                  </>
                ),
              },
              {
                timestamp: '2022-06-02 22:24:41',
                iconComponent: <IcoUserCircle16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.firstName} />,{' '}
                    <FieldTag dataKind={DataKind.dob} /> verified by{' '}
                    <Typography variant="label-3" as="span">
                      Experian
                    </Typography>
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                iconComponent: <IcoBuilding16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.country} />,{' '}
                    <FieldTag dataKind={DataKind.state} /> verified by{' '}
                    <Typography variant="label-3" as="span">
                      Socure
                    </Typography>
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                iconComponent: <IcoBuilding16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.streetAddress} />
                    ,&nbsp;
                    <FieldTag dataKind={DataKind.streetAddress2} />
                    ,&nbsp;
                    <FieldTag dataKind={DataKind.city} />
                    ,&nbsp;
                    <FieldTag dataKind={DataKind.zip} /> verified by{' '}
                    <Typography variant="label-3" as="span">
                      Socure
                    </Typography>
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                iconComponent: <IcoUserCircle16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.ssn} /> verified by{' '}
                    <Typography variant="label-3" as="span">
                      LexisNexis
                    </Typography>
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:26:41',
                iconComponent: <IcoFootprint16 />,
                headerComponent: (
                  <Typography variant="label-3" color="success">
                    Verified by Footprint
                  </Typography>
                ),
              },
            ]}
          />
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
