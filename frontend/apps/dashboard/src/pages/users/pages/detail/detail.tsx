import FieldTag from '@src/components/field-tag';
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
  DataKind,
  DecryptedUserAttributes,
  DecryptUserRequest,
} from '../../hooks/use-decrypt-user';
import useJoinUsers, {
  DecryptedAttributes,
  UserData,
} from '../../hooks/use-join-users';
import BasicInfo from './components/basic-info';

const Detail = () => {
  const getOnboardings = useGetOnboardings();
  const [decryptedUsers, { set: setDecryptedUser }] = useMap<
    String,
    DecryptedAttributes
  >(new Map());

  const decryptUserMutation = useDecryptUser();

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);
  // TODO error handling when this data is empty
  // https://linear.app/footprint/issue/FP-202
  const user = users?.[0]!;

  const loadEncryptedAttributes = (
    fieldsToDecrypt: (keyof typeof DataKind)[],
    reason: string,
  ) => {
    const decryptUserRequest: DecryptUserRequest = {
      footprintUserId: user.footprintUserId,
      attributes: fieldsToDecrypt.map(x => DataKind[x]),
      reason,
    };

    // Immediately set these attributes as loading
    const loadingUserAttributes = Object.fromEntries(
      fieldsToDecrypt.map(x => [x, { isLoading: true }]),
    );
    const currentDecryptedUser =
      decryptedUsers.get(user.footprintUserId) || ({} as DecryptedAttributes);
    setDecryptedUser(user.footprintUserId, {
      ...currentDecryptedUser,
      ...loadingUserAttributes,
    });

    // Trigger the mutation to decrypt the data. Upon completion, update these attributes with the
    // decrypted values
    decryptUserMutation
      .mutateAsync(decryptUserRequest)
      .then((decryptedUserAttributes: DecryptedUserAttributes) => {
        // Map from string values to UserData values that contain isLoading: false
        const newAttrs = Object.fromEntries(
          Object.entries(decryptedUserAttributes).map(x => [
            x[0],
            { value: x[1], isLoading: false } as UserData,
          ]),
        );
        // TODO https://linear.app/footprint/issue/FP-256/create-new-hook-for-updating-decrypted-fields
        setDecryptedUser(user.footprintUserId, {
          ...currentDecryptedUser,
          ...newAttrs,
        });
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
          <UserHeader user={user} onDecrypt={loadEncryptedAttributes} />
          <PaddedDivider />
          <BasicInfo user={user} />
          <Box sx={{ height: '40px' }}>&nbsp;</Box>
          <Typography variant="heading-3" sx={{ userSelect: 'none' }}>
            Audit trail
          </Typography>
          <PaddedDivider />
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
                iconComponent: <IcoUserCircle16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.firstName} />
                    ,&nbsp;
                    <FieldTag dataKind={DataKind.dob} />
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                iconComponent: <IcoBuilding16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.country} />
                    ,&nbsp;
                    <FieldTag dataKind={DataKind.state} /> verified by Socure
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
                    <FieldTag dataKind={DataKind.zip} /> verified by Socure
                  </Typography>
                ),
              },
              {
                timestamp: '2022-06-02 22:25:41',
                iconComponent: <IcoUserCircle16 />,
                headerComponent: (
                  <Typography variant="body-3">
                    <FieldTag dataKind={DataKind.ssn} /> verified by LexisNexis
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

const PaddedDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0;
  `};
`;

export default Detail;
