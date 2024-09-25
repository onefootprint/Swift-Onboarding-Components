import type { BusinessPerson } from '@onefootprint/types';
import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Row from './components/row';

type PersonListProps = {
  data: BusinessPerson[];
};

const PersonList = ({ data }: PersonListProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights.people.table',
  });

  const columns = [
    { text: t('header.name'), width: '50%' },
    { text: t('header.role'), width: '50%' },
  ];

  return (
    <Table<BusinessPerson>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={t('empty-state')}
      getKeyForRow={(person: BusinessPerson) => `${person.name} ${person.role}`}
      items={data}
      renderTr={renderTr}
    />
  );
};

const renderTr = ({ item }: TableRow<BusinessPerson>) => <Row person={item} />;

export default PersonList;
