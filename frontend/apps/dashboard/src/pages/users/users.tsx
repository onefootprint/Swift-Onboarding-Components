import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Row, Table } from 'src/components/table';
import { statusToBadgeVariant, statusToDisplayText } from 'src/types';
import styled, { css } from 'styled-components';
import { Badge, Code, SearchInput, Typography } from 'ui';

import FieldOrPlaceholder from './components/field-or-placeholder';
import UsersFilter from './components/filter-dialog';
import useGetUsers from './hooks/use-get-users';
import { nameData, User } from './hooks/use-join-users';
import Pagination from './pages/detail/components/pagination';

const columns = [
  { text: 'Name', width: '14%' },
  { text: 'Footprint Token', width: '14%' },
  { text: 'Status', width: '14%' },
  { text: 'Email', width: '14%' },
  { text: 'SSN', width: '14%' },
  { text: 'Phone Number', width: '14%' },
  { text: 'Date', width: '19%' },
];

const PAGE_SIZE = 10;

const Users = () => {
  const {
    users,
    totalNumResults,
    pageIndex,
    isLoading,
    loadNextPage,
    loadPrevPage,
    hasNextPage,
    hasPrevPage,
    filters,
    setFilter,
  } = useGetUsers(PAGE_SIZE);

  const [searchText, setSearchText] = useState<string>();

  const router = useRouter();

  // Bind the contents of the search text box to the querystring
  useEffect(() => {
    setSearchText(filters.fingerprint || '');
  }, [filters]);

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
              <CodeContainer>
                <Code>{item.footprintUserId}</Code>
              </CodeContainer>
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
                {new Date(item.startTimestamp).toLocaleString('en-us', {
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
      <Pagination
        totalNumResults={totalNumResults}
        pageSize={PAGE_SIZE}
        pageIndex={pageIndex}
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

const CodeContainer = styled.div`
  button {
    width: 100%;
  }
`;

export default Users;
