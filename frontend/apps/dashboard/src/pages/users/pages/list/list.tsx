import { useTranslation } from '@onefootprint/hooks';
import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { EntitiesList, EntitiesTable } from 'src/components/entities';

import Row from './components/row';

const List = () => {
  const { t } = useTranslation('pages.users');
  const columns = [
    { text: t('table.header.name'), width: '14%' },
    { text: t('table.header.token'), width: '18%' },
    { text: t('table.header.status'), width: '12%' },
    { text: t('table.header.email'), width: '20%' },
    { text: t('table.header.ssn'), width: '12%' },
    { text: t('table.header.phone-number'), width: '15%' },
    { text: t('table.header.start'), width: '15%' },
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntitiesList
        title={t('header.title')}
        kind={EntityKind.person}
        basePath="users"
      >
        <EntitiesTable
          aria-label={t('table.aria-label')}
          searchPlaceholder={t('table.search-placeholder')}
          columns={columns}
          emptyStateText={t('table.empty-state')}
          renderTr={entity => <Row entity={entity} />}
        />
      </EntitiesList>
    </>
  );
};

export default List;
