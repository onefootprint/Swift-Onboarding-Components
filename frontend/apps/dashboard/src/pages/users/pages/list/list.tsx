import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EntitiesList, EntitiesTable } from 'src/components/entities';

import Row from './components/row';

const List = () => {
  const { t } = useTranslation('users');
  const columns = [
    { text: t('table.header.id'), width: '30%' },
    { text: t('table.header.status'), width: '25%' },
    { text: t('table.header.created'), width: '25%' },
    { text: t('table.header.other'), width: '20%' },
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
