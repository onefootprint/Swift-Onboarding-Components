import { STATES } from '@onefootprint/global-constants';
import { Table, type TableRow } from '@onefootprint/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Subsection from '../../../../../subsection';
import type { FormattedRegistration } from '../../../../onboarding-business-insight.types';
import DrawerFilter from './components/drawer-filter';
import Row from './components/row';
import useSOSFilingsFilters from './hooks/use-sos-filings-filters';

type SOSFilingsProps = {
  data: FormattedRegistration[];
  onClick: (registrationId: string) => void;
};

const SOSFilings = ({ data, onClick }: SOSFilingsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.registrations' });
  const filters = useSOSFilingsFilters();
  const filteredData = useMemo(
    () =>
      filters.values.states.length ? data.filter(({ state }) => state && filters.values.states.includes(state)) : data,
    [data, filters.values.states],
  );
  const stateFilterOptions = [
    ...new Set(
      data
        .map(({ state }) => state)
        .filter(state => {
          const isStateValid = Boolean(STATES.find(s => s.label === state));
          return isStateValid;
        }),
    ),
  ];
  const columns = [
    { text: t('table.header.state'), width: '33%' },
    { text: t('table.header.file-date'), width: '33%' },
    { text: t('table.header.status'), width: '33%' },
  ];

  const renderTr = ({ item }: TableRow<FormattedRegistration>) => {
    return <Row filing={item} />;
  };

  return (
    <Subsection title={t('title')}>
      <div className="flex flex-col gap-3">
        {filters.isReady && <DrawerFilter states={stateFilterOptions} />}
        <Table<FormattedRegistration>
          aria-label={t('table.aria-label')}
          columns={columns}
          emptyStateText={t('table.empty-state')}
          getKeyForRow={(filing: FormattedRegistration) => filing.id}
          items={filteredData}
          onRowClick={(filing: FormattedRegistration) => onClick(filing.id)}
          renderTr={renderTr}
        />
      </div>
    </Subsection>
  );
};

export default SOSFilings;
