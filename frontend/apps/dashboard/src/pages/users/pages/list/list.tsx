import { EntityKind } from '@onefootprint/types';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { EntitiesList, EntitiesTable } from 'src/components/entities';

import Row from './components/row';

const List = () => {
  const { t } = useTranslation('users');
  const columns = [
    { text: t('table.header.name'), width: '16%' },
    { text: t('table.header.id'), width: '25%' },
    { text: t('table.header.status'), width: '17%' },
    {
      text: t('table.header.last-activity'),
      width: '17%',
      tooltip: {
        text: t('table.header.last-activity-tooltip'),
      },
    },
    { text: t('table.header.other'), width: '25%' },
  ];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <EntitiesList title={t('header.title')} kind={EntityKind.person} basePath="users">
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
