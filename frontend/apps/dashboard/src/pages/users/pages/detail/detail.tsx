import Timeline from '@src/components/timeline';
import UserHeader from '@src/pages/users/pages/detail/components/user-header';
import IcoBuilding16 from 'icons/ico/ico-building-16';
import IcoCheck16 from 'icons/ico/ico-check-16';
import IcoFootprint16 from 'icons/ico/ico-footprint-16';
import IcoUserCircle16 from 'icons/ico/ico-user-circle-16';
import React from 'react';
import useGetOnboardings from 'src/pages/users/hooks/use-get-onboardings';
import styled, { css } from 'styled-components';
import { Box, Divider, Typography } from 'ui';
import { useMap } from 'usehooks-ts';

import useDecryptUser, {
  DecryptedUserAttributes,
  DecryptUserRequest,
} from '../../hooks/use-decrypt-user';
import useJoinUsers from '../../hooks/use-join-users';
import BasicInfo from './components/basic-info';

const Detail = () => {
  const getOnboardings = useGetOnboardings();
  const [decryptedUsers, { set: setDecryptedUser }] = useMap<
    String,
    DecryptedUserAttributes
  >(new Map());

  const decryptUserMutation = useDecryptUser();

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);
  // TODO error handling when this data is empty
  // https://linear.app/footprint/issue/FP-202
  const user = users?.[0]!;

  const loadEncryptedAttributes = () => {
    const decryptUserRequest: DecryptUserRequest = {
      footprintUserId: user.footprintUserId,
      attributes: [
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'ssn',
        'dob',
        'country',
        'street_address',
        'street_address2',
        'city',
        'zip',
        'state',
      ],
    };
    decryptUserMutation
      .mutateAsync(decryptUserRequest)
      .then((decryptedUserAttributes: DecryptedUserAttributes) => {
        setDecryptedUser(user.footprintUserId, decryptedUserAttributes);
      });
  };

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
            onDecryptButtonClick={() => loadEncryptedAttributes()}
          />
          <PaddedDivider />
          <BasicInfo user={user} />
          <Box sx={{ height: '40px' }}>&nbsp;</Box>
          <Typography variant="heading-2" sx={{ userSelect: 'none' }}>
            Audit trail
          </Typography>
          <PaddedDivider />
          <Timeline
            items={[
              {
                timestamp: '2022-06-02 22:24:41',
                ItemIcon: IcoCheck16,
                headerComponent: (
                  <Typography variant="label-3">
                    Liveness checks succeeded
                  </Typography>
                ),
                bodyComponent: (
                  <>
                    <Typography variant="body-3" color="secondary">
                      •&nbsp;&nbsp;&nbsp;&nbsp;Attested by Apple & Footprint
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •&nbsp;&nbsp;&nbsp;&nbsp;iPhone 13 Pro Max, iOS 15.5
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •&nbsp;&nbsp;&nbsp;&nbsp;34.36.156.118 (IP address)
                    </Typography>
                    <Typography variant="body-3" color="secondary">
                      •&nbsp;&nbsp;&nbsp;&nbsp;San Francisco, California
                    </Typography>
                  </>
                ),
              },
              {
                timestamp: '2022-06-02 22:24:41',
                ItemIcon: IcoUserCircle16,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag>Name</FieldTag>
                    ,&nbsp;
                    <FieldTag>Date of birth</FieldTag> verified by Experian
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                ItemIcon: IcoBuilding16,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag>Country</FieldTag>
                    ,&nbsp;
                    <FieldTag>State</FieldTag> verified by Socure
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                ItemIcon: IcoBuilding16,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag>Address line 1</FieldTag>
                    ,&nbsp;
                    <FieldTag>Address line 2</FieldTag>
                    ,&nbsp;
                    <FieldTag>City</FieldTag>
                    ,&nbsp;
                    <FieldTag>Zip code</FieldTag> verified by Socure
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                ItemIcon: IcoUserCircle16,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag>Ssn</FieldTag> verified by LexisNexis
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:26:41',
                ItemIcon: IcoFootprint16,
                headerComponent: (
                  <Typography variant="label-3" color="success">
                    Verified by Footprint
                  </Typography>
                ),
              },
            ]}
          />
        </>
      )}
    </>
  );
};

const FieldTag = styled(Typography).attrs({ as: 'span', variant: 'label-4' })`
  ${({ theme }) => css`
    color: ${theme.color.neutral};
    background-color: ${theme.backgroundColor.neutral};
    padding: ${theme.spacing[1]}px ${theme.spacing[2]}px;
    border-radius: 4px; // TODO put in design library
  `};
`;

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]}px;
    display: flex;
    flex-direction: row;
  `};
`;

const PaddedDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0;
  `};
`;

export default Detail;
