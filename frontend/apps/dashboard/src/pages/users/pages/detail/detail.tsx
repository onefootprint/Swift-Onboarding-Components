import React from 'react';
import useGetOnboardings from 'src/pages/users/hooks/use-get-onboardings';
import styled, { css } from 'styled-components';
import { Divider, Typography } from 'ui';
import { useMap } from 'usehooks-ts';

import useDecryptUser, {
  DecryptedUserAttributes,
  DecryptUserRequest,
} from '../../hooks/use-decrypt-user';
import useJoinUsers from '../../hooks/use-join-users';
import BasicInfo from './components/basic-info';
import UserHeader from './components/user-header';

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
