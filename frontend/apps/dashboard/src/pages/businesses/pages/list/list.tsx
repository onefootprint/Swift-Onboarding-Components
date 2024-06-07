import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EntitiesList, EntitiesTable } from 'src/components/entities';

import Row from './components/row';

const List = () => {
  const { t } = useTranslation('businesses');
  const columns = [
    { text: t('table.header.name'), width: '20%' },
    { text: t('table.header.id'), width: '22.5%' },
    { text: t('table.header.status'), width: '17.5%' },
    { text: t('table.header.last-activity'), width: '20%' },
    { text: t('table.header.other'), width: '20%' },
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntitiesList basePath="businesses" kind={EntityKind.business} title={t('header.title')}>
        <EntitiesTable
          aria-label={t('table.aria-label')}
          columns={columns}
          emptyStateText={t('table.empty-state')}
          renderTr={entity => <Row entity={entity} />}
          searchPlaceholder={t('table.search-placeholder')}
        />
      </EntitiesList>
    </>
  );
};

export default List;
