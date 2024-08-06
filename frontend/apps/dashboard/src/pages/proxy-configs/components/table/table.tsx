import type { ProxyConfig } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useFilters from '../../hooks/use-filters';
import Row from './components/row';

type TableProps = {
  data?: ProxyConfig[];
  errorMessage?: string;
  isLoading?: boolean;
};

const Table = ({ data, isLoading, errorMessage }: TableProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.proxy-configs' });
  const filters = useFilters();
  const columns = [
    { id: 'name', text: t('table.header.name'), width: '11.5%' },
    { id: 'id', text: t('table.header.id'), width: '20%' },
    { id: 'url', text: t('table.header.url'), width: '18.5%' },
    { id: 'httpMethod', text: t('table.header.method'), width: '10%' },
    { id: 'created', text: t('table.header.created_at'), width: '15%' },
    { id: 'status', text: t('table.header.status'), width: '12.5%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  const handleClick = (proxyConfig: ProxyConfig) => {
    filters.push({ proxy_config_id: proxyConfig.id });
  };

  return (
    <UITable<ProxyConfig>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getAriaLabelForRow={proxyConfig => proxyConfig.name}
      getKeyForRow={proxyConfig => proxyConfig.id}
      isLoading={isLoading}
      items={data}
      onRowClick={handleClick}
      renderTr={({ item: proxyConfig }) => <Row proxyConfig={proxyConfig} />}
    />
  );
};

export default Table;
