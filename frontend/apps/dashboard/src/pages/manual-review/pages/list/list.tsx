import { useTranslation } from '@onefootprint/hooks';
import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import React from 'react';
import { EntitiesList } from 'src/components/entities';

import Row from './components/row';
import ManualReviewTable from './components/table';

const List = () => {
  const { t } = useTranslation('pages.manual-review');
  const columns = [
    { text: t('table.header.name'), width: '20%' },
    { text: t('table.header.token'), width: '23%' },
    { text: t('table.header.status'), width: '13%' },
    { text: t('table.header.email'), width: '26%' },
    { text: t('table.header.pending-since'), width: '18%' },
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntitiesList
        title={t('header.title')}
        subtitle={t('header.subtitle')}
        kind={EntityKind.person}
        basePath="users"
        defaultFilters={{ requires_manual_review: true }}
      >
        <ManualReviewTable
          aria-label={t('table.aria-label')}
          columns={columns}
          emptyStateText={t('table.empty-state')}
          renderTr={entity => <Row entity={entity} />}
        />
      </EntitiesList>
    </>
  );
};

export default List;
