import { Table, type TableRow } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedPerson } from '../../../../onboarding-business-insight.types';
import Row from './components/row';

type PeopleProps = {
  data: FormattedPerson[];
};

const People = ({ data }: PeopleProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.people' });

  const columns = [
    { text: t('table.header.name'), width: '50%' },
    { text: t('table.header.role'), width: '50%' },
  ];

  return (
    <Subsection title={t('title')}>
      <Table<FormattedPerson>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={t('table.empty-state')}
        getKeyForRow={(person: FormattedPerson) => `${person.name} ${person.role}`}
        items={data}
        renderTr={renderTr}
      />
    </Subsection>
  );
};

const renderTr = ({ item }: TableRow<FormattedPerson>) => <Row person={item} />;

export default People;
