import IcoSearch16 from 'icons/ico/ico-search-16';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Row, Table } from 'src/components/table';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import { DecryptedUserAttributes } from 'src/pages/users/hooks/use-decrypt-user';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import useGetOnboardings, {
  statusToBadgeVariant,
  statusToDisplayText,
} from 'src/pages/users/hooks/use-get-onboardings';
import useJoinUsers, { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';
import { Badge, TextInput, Typography } from 'ui';
import { useMap } from 'usehooks-ts';

import DecryptDataDialog from './components/decrypt-data-dialog';
import UsersFilter from './components/users-filter';

const columns = [
  { text: 'Name', width: '12.5%' },
  { text: 'Footprint Token', width: '20%' },
  { text: 'Status', width: '12.5%' },
  { text: 'Email', width: '12.5%' },
  { text: 'SSN', width: '12.5%' },
  { text: 'Phone Number', width: '12.5%' },
  { text: 'Date', width: '17.5%' },
];

const Users = () => {
  const getOnboardings = useGetOnboardings();

  const { query, setFilter } = useFilters();
  const [searchText, setSearchText] = useState<string>();

  const router = useRouter();

  // Bind the contents of the search text box to the querystring
  useEffect(() => {
    setSearchText(query.fingerprint || '');
  }, [query]);

  // TODO rm
  const [decryptedUsers] = useMap<String, DecryptedUserAttributes>(new Map());
  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);

  return (
    <>
      <HeaderContainer>
        <Typography variant="heading-2">Users</Typography>
      </HeaderContainer>
      <SearchTextInput
        placeholder="Search (exact match)..."
        prefixElement={<IcoSearchContainer />}
        suffixElement={<UsersFilter />}
        value={searchText}
        onChangeText={(text: string) =>
          setFilter({
            fingerprint: text,
          })
        }
      />
      <Table
        items={users}
        isLoading={getOnboardings.isLoading}
        getKeyForRow={(item: User) => item.footprintUserId}
        onRowClick={(item: User) => {
          router.push({
            pathname: 'users/detail',
            query: { footprint_user_id: item.footprintUserId },
          });
        }}
        columns={columns}
        renderTr={({ item }: Row<User>) => (
          <>
            <td>
              <FieldOrPlaceholder value={item.name} />
            </td>
            <td>
              <Typography variant="body-3">{item.footprintUserId}</Typography>
            </td>
            <td>
              <Badge variant={statusToBadgeVariant[item.status]}>
                {statusToDisplayText[item.status]}
              </Badge>
            </td>
            <td>
              <FieldOrPlaceholder value={item.email} />
            </td>
            <td>
              <FieldOrPlaceholder value={item.ssn} />
            </td>
            <td>
              <FieldOrPlaceholder value={item.phoneNumber} />
            </td>
            <td>
              <Typography variant="body-3" color="primary">
                {/* TODO better formatting utils */}
                {new Date(item.initiatedAt).toLocaleString('en-us', {
                  month: 'numeric',
                  day: 'numeric',
                  year: '2-digit',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Typography>
            </td>
          </>
        )}
      />
      <DecryptDataDialog open={false} onClose={() => {}} />
    </>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
  `};
`;

const SearchTextInput = styled(TextInput)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  height: 100%;
  ${({ theme }) => css`
    padding-top: ${theme.spacing[5]}px;
    padding-bottom: ${theme.spacing[5]}px;
  `};
`;

const IcoSearchContainer = styled(IcoSearch16)`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[6]}px;
  `};
`;

export default Users;
