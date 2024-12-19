import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import type { FormattedName } from '../../../../../../onboarding-business-insight.types';
import Row from './components/row';

type BusinessNameListProps = {
  data: FormattedName[];
  onOpen: (id: string) => void;
};

const BusinessNameList = ({ data, onOpen }: BusinessNameListProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.business-details.name.table' });

  const columns = [
    { text: t('header.name'), width: '50%' },
    { text: t('header.type'), width: '50%' },
  ];

  const renderTr = ({ item }: TableRow<FormattedName>) => <Row businessName={item} onOpen={onOpen} />;

  return (
    <Table<FormattedName>
      aria-label={t('aria-label')}
      columns={columns}
      emptyStateText={t('empty-state')}
      getKeyForRow={(businessName: FormattedName) => `${businessName.name} ${businessName.kind}`}
      items={data}
      renderTr={renderTr}
    />
  );
};

export default BusinessNameList;
