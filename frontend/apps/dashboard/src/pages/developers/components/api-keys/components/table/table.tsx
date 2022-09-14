import { useTranslation } from 'hooks';
import React from 'react';
import { getErrorMessage } from 'request';
import type { ApiKey } from 'types';
import { Table, TableRow } from 'ui';

import Row from './components/row';
import useApiKeys from './hooks/use-api-keys';

const renderTr = ({ item }: TableRow<ApiKey>) => <Row apiKey={item} />;

const ApiKeysTable = () => {
  const { isLoading, error, data } = useApiKeys();
  const { t } = useTranslation('pages.developers.api-keys');
  const columns = [
    { text: t('table.header.name'), width: '15%' },
    { text: t('table.header.token'), width: '25%' },
    { text: t('table.header.last-used'), width: '17.5%' },
    { text: t('table.header.created'), width: '17.5%' },
    { text: t('table.header.status'), width: '15%' },
    { text: '', width: '10%' },
  ];

  return (
    <Table<ApiKey>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
      getKeyForRow={(apiKey: ApiKey) => apiKey.id}
      isLoading={isLoading}
      items={data}
      renderTr={renderTr}
    />
  );
};

export default ApiKeysTable;
