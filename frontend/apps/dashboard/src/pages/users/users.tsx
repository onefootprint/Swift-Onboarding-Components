import { useTranslation } from '@onefootprint/hooks';
import {
  Badge,
  Button,
  CodeInline,
  Pagination,
  Table,
  TableRow,
  Typography,
} from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import {
  statusToBadgeVariant,
  statusToDisplayText,
} from 'src/constants/onboarding-status-display';

import FieldOrPlaceholder from './components/field-or-placeholder';
import Filters from './components/filters';
import useGetUsers from './hooks/use-get-users';
import { nameData, User } from './hooks/use-join-users';

const PAGE_SIZE = 10;

const Users = () => {
  const router = useRouter();
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

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Typography variant="heading-3" sx={{ marginBottom: 5 }}>
        {t('header.title')}
      </Typography>
      <Table<User>
        search={filters.fingerprint}
        onChangeSearchText={fingerprint => {
          setFilter({ fingerprint });
        }}
        renderActions={() => (
          <Filters
            renderCta={({ onClick, filtersCount }) => (
              <Button size="small" variant="secondary" onClick={onClick}>
                {t('filters.cta', { count: filtersCount })}
              </Button>
            )}
          />
        )}
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
      {totalNumResults > 0 && (
        <Pagination
          totalNumResults={totalNumResults}
          pageSize={PAGE_SIZE}
          pageIndex={pageIndex}
          onNextPage={loadNextPage}
          onPrevPage={loadPrevPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      )}
    </>
  );
};

export default Users;
