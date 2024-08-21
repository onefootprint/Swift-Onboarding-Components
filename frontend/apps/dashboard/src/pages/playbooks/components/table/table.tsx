import type { tabsRouterSchema } from '@/playbooks/utils/schema';
import type { OnboardingConfig } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import useFilters from '../../hooks/use-filters';
import Row from './components/row';

type TableProps = {
  data?: OnboardingConfig[];
  errorMessage?: string;
  isLoading?: boolean;
};

const Table = ({ data, isLoading, errorMessage }: TableProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.playbooks' });
  const router = useRouter();
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
    const query: z.infer<typeof tabsRouterSchema> = { ...filters.query, tab: 'data' };

    router.push({
      pathname: `/playbooks/${config.id}`,
      query,
    });
  };

  return (
    <UITable<OnboardingConfig>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('empty-description')}
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
