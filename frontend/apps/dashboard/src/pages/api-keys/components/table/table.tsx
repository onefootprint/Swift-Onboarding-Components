import { getErrorMessage } from '@onefootprint/request';
import type { ApiKey } from '@onefootprint/types';
import type { TableRow } from '@onefootprint/ui';
import { Table } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Row from './components/row';
import useApiKeys from './hooks/use-api-keys';

const renderTr = ({ item }: TableRow<ApiKey>) => <Row apiKey={item} />;

const ApiKeysTable = () => {
  const { isPending, error, data } = useApiKeys();
  const { t } = useTranslation('api-keys', {});
  const columns = [
    { text: t('table.header.name'), width: '15%' },
    { text: t('table.header.secret-key'), width: '25%' },
    { text: t('table.header.last-used'), width: '15%' },
    { text: t('table.header.created'), width: '15%' },
    { text: t('table.header.status'), width: '12.5%' },
    { text: t('table.header.access-control.title'), width: '12.5%' },
    { text: '', width: '10%' },
  ];

  return (
    <Table<ApiKey>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
      getAriaLabelForRow={(apiKey: ApiKey) => apiKey.name}
      getKeyForRow={(apiKey: ApiKey) => apiKey.id}
      isLoading={isPending}
      items={data}
      renderTr={renderTr}
      hasRowEmphasis={() => true}
    />
  );
};

export default ApiKeysTable;
