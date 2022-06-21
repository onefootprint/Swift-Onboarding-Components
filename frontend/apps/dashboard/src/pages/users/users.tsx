import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Row, Table } from 'src/components/table';
import FieldOrPlaceholder from 'src/pages/users/components/field-or-placeholder';
import { nameData, User } from 'src/pages/users/hooks/use-join-users';
import { statusToBadgeVariant, statusToDisplayText } from 'src/types';
import styled, { css } from 'styled-components';
import { Badge, Code, SearchInput, Typography } from 'ui';

import UsersFilter from './components/users-filter';
import useGetUsers from './hooks/use-get-users';
import Pagination from './pages/detail/components/pagination';

const columns = [
  { text: 'Name', width: '15%' },
  { text: 'Footprint Token', width: '12.5%' },
  { text: 'Status', width: '12.5%' },
  { text: 'Email', width: '15%' },
  { text: 'SSN', width: '12.5%' },
  { text: 'Phone Number', width: '15%' },
  { text: 'Date', width: '15%' },
  { text: 'ID', width: '6%' },
];

const Users = () => {
  const {
    users,
    isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage,
    hasPrevPage,
    query,
    setFilter,
  } = useGetUsers();

  const [searchText, setSearchText] = useState<string>();

  const router = useRouter();

  // Bind the contents of the search text box to the querystring
  useEffect(() => {
    setSearchText(query.fingerprint || '');
  }, [query]);

  return (
    <>
      <HeaderContainer>
        <Typography variant="heading-2">Users</Typography>
      </HeaderContainer>
      <StyledSearchInput
        placeholder="Search (exact match)..."
        suffixElement={<UsersFilter />}
        value={searchText}
        inputSize="large"
        onChangeText={(text: string) =>
          setFilter({
            fingerprint: text,
          })
        }
      />
      <Table
        items={users}
        isLoading={isLoading}
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
              <FieldOrPlaceholder data={nameData(item.attributes)} />
            </td>
            <td>
              <Code>{item.footprintUserId}</Code>
            </td>
            <td>
              <Badge variant={statusToBadgeVariant[item.status]}>
                {statusToDisplayText[item.status]}
              </Badge>
            </td>
            <td>
              <FieldOrPlaceholder data={item.attributes.email} />
            </td>
            <td>
              <FieldOrPlaceholder data={item.attributes.ssn} />
            </td>
            <td>
              <FieldOrPlaceholder data={item.attributes.phoneNumber} />
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
            <td>
              <Typography variant="body-3">{item.orderingId}</Typography>
            </td>
          </>
        )}
      />
      <Pagination
        onNextPage={loadNextPage}
        onPrevPage={loadPrevPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </>
  );
};

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;
  `};
`;

const StyledSearchInput = styled(SearchInput)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  height: 52px;
`;

export default Users;
