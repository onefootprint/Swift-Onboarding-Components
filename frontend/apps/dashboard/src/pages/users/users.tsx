import IcoLock16 from 'icons/ico/ico-lock-16';
import IcoSearch16 from 'icons/ico/ico-search-16';
import React from 'react';
import { Row, Table, Th } from 'src/components/table';
import useDecryptUser, {
  DecryptedUserAttributes,
  DecryptUserRequest,
} from 'src/pages/users/hooks/use-decrypt-user';
import useGetOnboardings, {
  OnboardingStatus,
} from 'src/pages/users/hooks/use-get-onboardings';
import useJoinUsers, { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css, UIState } from 'styled';
import { Badge, Box, TextInput, Typography } from 'ui';
import { useMap } from 'usehooks-ts';

const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.processing]: 'neutral',
  [OnboardingStatus.manualReview]: 'error',
  [OnboardingStatus.incomplete]: 'warning',
  [OnboardingStatus.failed]: 'error',
};

const statusToDisplayText = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.processing]: 'Processing',
  [OnboardingStatus.manualReview]: 'Manual review',
  [OnboardingStatus.incomplete]: 'Incomplete',
  [OnboardingStatus.failed]: 'Failed',
};

const TableHeader = () => (
  <>
    <Th style={{ width: '100px' }}>
      <Typography variant="body-3" color="secondary">
        NAME
      </Typography>
    </Th>
    <Th style={{ width: '100px' }}>
      <Typography variant="body-3" color="secondary">
        FOOTPRINT TOKEN
      </Typography>
    </Th>
    <Th style={{ width: '100px' }}>
      <Typography variant="body-3" color="secondary">
        STATUS
      </Typography>
    </Th>
    <Th style={{ width: '200px' }}>
      <Typography variant="body-3" color="secondary">
        EMAIL
      </Typography>
    </Th>
    <Th style={{ width: '100px' }}>
      <Typography variant="body-3" color="secondary">
        SSN
      </Typography>
    </Th>
    <Th style={{ width: '100px' }}>
      <Typography variant="body-3" color="secondary">
        PHONE NUMBER
      </Typography>
    </Th>
    <Th style={{ width: '150px' }}>
      <Typography variant="body-3" color="secondary">
        DATE
      </Typography>
    </Th>
  </>
);

const EncryptedCell = () => (
  <>
    <MarginIcoLock16 />
    <Typography variant="body-3" color="primary">
      •••••••••
    </Typography>
  </>
);

type FieldOrPlaceholderProps = {
  value: string | undefined;
};

const FieldOrPlaceholder = ({ value }: FieldOrPlaceholderProps) =>
  value ? (
    <Typography variant="body-3" color="primary">
      {value}
    </Typography>
  ) : (
    <EncryptedCell />
  );

const Users = () => {
  const [decryptedUsers, { set: setDecryptedUser }] = useMap<
    String,
    DecryptedUserAttributes
  >(new Map());

  const decryptUserMutation = useDecryptUser();
  const getOnboardings = useGetOnboardings();
  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);

  const loadEncryptedAttributes = (footprintUserId: string) => {
    const decryptUserRequest: DecryptUserRequest = {
      footprintUserId,
      attributes: ['first_name', 'last_name', 'phone_number', 'email', 'ssn'],
    };
    decryptUserMutation
      .mutateAsync(decryptUserRequest)
      .then((decryptedUserAttributes: DecryptedUserAttributes) => {
        setDecryptedUser(footprintUserId, decryptedUserAttributes);
      });
  };

  return (
    // TODO embed IcoSearch16 inside TextInput
    <>
      <Box>
        <IcoSearch16 />
        <TextInput placeholder="Search (exact match)..." />
      </Box>
      <Table
        items={users}
        isLoading={getOnboardings.isLoading}
        getKeyForRow={(item: User) => item.footprintUserId}
        onRowClick={(item: User) => {
          loadEncryptedAttributes(item.footprintUserId);
        }}
        renderHeader={() => <TableHeader />}
        renderRow={({ item }: Row<User>) => (
          <>
            <td>
              <TableCell>
                <FieldOrPlaceholder value={item.name} />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Typography variant="body-3">{item.footprintUserId}</Typography>
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Badge variant={statusToBadgeVariant[item.status]}>
                  {statusToDisplayText[item.status]}
                </Badge>
              </TableCell>
            </td>
            <td>
              <TableCell>
                <FieldOrPlaceholder value={item.email} />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <FieldOrPlaceholder value={item.ssn} />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <FieldOrPlaceholder value={item.phoneNumber} />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Typography variant="body-3" color="primary">
                  {/* TODO better formatting utils */}
                  {new Date(item.initiatedAt).toLocaleString('en-us', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Typography>
              </TableCell>
            </td>
          </>
        )}
      />
    </>
  );
};

const MarginIcoLock16 = styled(IcoLock16)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `};
`;

const TableCell = styled.div`
  display: flex;
`;

export default Users;
