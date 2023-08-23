import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import React from 'react';

import useFilters from '../../utils/use-filters';
import Row from './components/row';

type TableProps = {
  data?: OnboardingConfig[];
  errorMessage?: string;
  isLoading?: boolean;
};

const Table = ({ data, isLoading, errorMessage }: TableProps) => {
  const { t } = useTranslation('pages.playbooks');
  const filters = useFilters();
  const columns = [
    { id: 'name', text: t('table.header.name'), width: '25%' },
    { id: 'type', text: t('table.header.type'), width: '10%' },
    { id: 'key', text: t('table.header.key'), width: '30%' },
    { id: 'status', text: t('table.header.status'), width: '15%' },
    { id: 'created', text: t('table.header.created'), width: '15%' },
    { id: 'actions', text: '', width: '5%' },
  ];

  const handleRowClick = (config: OnboardingConfig) => {
    filters.push({ onboarding_config_id: config.id });
  };

  return (
    <UITable<OnboardingConfig>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getAriaLabelForRow={onboardingConfig => onboardingConfig.name}
      getKeyForRow={onboardingConfig => onboardingConfig.id}
      isLoading={isLoading}
      items={data}
      onRowClick={handleRowClick}
      renderTr={({ item: playbook }) => <Row playbook={playbook} />}
    />
  );
};

export default Table;
