import { useTranslation } from '@onefootprint/hooks';
import {
  Badge,
  Box,
  Button,
  CodeInline,
  Divider,
  Pagination,
  SearchInput,
  Table,
  TableRow,
  Typography,
} from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  statusToBadgeVariant,
  statusToDisplayText,
} from 'src/constants/onboarding-status-display';
import styled from 'styled-components';

import FieldOrPlaceholder from './components/field-or-placeholder';
import Filters from './components/filters';
import useGetUsers from './hooks/use-get-users';
import { nameData, User } from './hooks/use-join-users';

const PAGE_SIZE = 10;

const Users = () => {
  const { t } = useTranslation('pages.users');
  const columns = [
    { text: t('table.header.name'), width: '14%' },
    { text: t('table.header.token'), width: '19%' },
    { text: t('table.header.status'), width: '8%' },
    { text: t('table.header.email'), width: '20%' },
    { text: t('table.header.ssn'), width: '12%' },
    { text: t('table.header.phone-number'), width: '14%' },
    { text: t('table.header.start'), width: '13%' },
  ];
  const [searchText, setSearchText] = useState<string>('');
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

  const router = useRouter();

  // Bind the contents of the search text box to the querystring
  useEffect(() => {
    setSearchText(filters.fingerprint || '');
  }, [filters]);

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-2" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <SearchContainer>
        <SearchInput
          inputSize="compact"
          sx={{ width: '300px' }}
          value={searchText}
          onChangeText={(text: string) =>
            setFilter({
              fingerprint: text,
            })
          }
        />
        <Filters
          renderCta={({ onClick, filtersCount }) => (
            <Button size="small" variant="secondary" onClick={onClick}>
              {t('filters.cta', { count: filtersCount })}
            </Button>
          )}
        />
      </SearchContainer>
      <Box sx={{ paddingY: 5 }}>
        <Divider />
      </Box>
      <Table<User>
        aria-label={t('table.aria-label')}
        emptyStateText={t('table.empty-state')}
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
        renderTr={({ item }: TableRow<User>) => (
          <>
            <td>
              <FieldOrPlaceholder data={nameData(item.attributes)} />
            </td>
            <td>
              <CodeInline truncate>{item.footprintUserId}</CodeInline>
            </td>

            <td>
              <Badge variant={statusToBadgeVariant[item.status!]}>
                {statusToDisplayText[item.status!]}
              </Badge>
            </td>

            <td>
              <FieldOrPlaceholder data={item.attributes.email} />
            </td>
            <td>
              <FieldOrPlaceholder
                data={item.attributes.ssn9 || item.attributes.ssn4}
              />
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

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default Users;
