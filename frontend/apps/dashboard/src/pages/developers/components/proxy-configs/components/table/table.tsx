import { useTranslation } from '@onefootprint/hooks';
import { ProxyConfig } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import React from 'react';

import Row from './components/row';

type TableProps = {
  data?: ProxyConfig[];
  errorMessage?: string;
  isLoading?: boolean;
};

const Table = ({ data, isLoading, errorMessage }: TableProps) => {
  const { t } = useTranslation('pages.proxy-configs');
  const columns = [
    { id: 'name', text: t('table.header.name'), width: '25%' },
    { id: 'url', text: t('table.header.url'), width: '25%' },
    { id: 'httpMethod', text: t('table.header.method'), width: '15%' },
    { id: 'created', text: t('table.header.created_at'), width: '15%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  return (
    <UITable<ProxyConfig>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={proxyConfig => proxyConfig.id}
      isLoading={isLoading}
      items={data}
      renderTr={({ item: proxyConfig }) => <Row proxy={proxyConfig} />}
    />
  );
};

export default Table;
