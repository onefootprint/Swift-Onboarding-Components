import type { BusinessName } from '@onefootprint/types';
import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Row from './components/row';

type BusinessNameListProps = {
  data: BusinessName[];
  onOpen: (id: string) => void;
};

const BusinessNameList = ({ data, onOpen }: BusinessNameListProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.name.table',
  });

  const columns = [
    { text: t('header.name'), width: '42%' },
    { text: t('header.type'), width: '22%' },
    { text: t('header.notes'), width: '36%' },
  ];

  const renderTr = ({ item }: TableRow<BusinessName>) => <Row businessName={item} onOpen={onOpen} />;

  return (
    <Table<BusinessName>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={t('empty-state')}
      getKeyForRow={(bn: BusinessName) => `${bn.name} ${bn.kind}`}
      items={data}
      renderTr={renderTr}
    />
  );
};

export default BusinessNameList;
