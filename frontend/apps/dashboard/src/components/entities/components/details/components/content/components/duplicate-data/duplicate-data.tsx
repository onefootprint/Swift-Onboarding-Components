import { getErrorMessage } from '@onefootprint/request';
import type { DuplicateDataItem } from '@onefootprint/types';
import { Table } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useCurrentEntityDuplicateData from 'src/components/entities/components/details/hooks/use-current-entity-duplicate-data';
import useSession from 'src/hooks/use-session';

import Section from '../section';
import OtherTenantSummary from './components/other-tenant-summary';
import Row from './components/row';

const DuplicateData = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'duplicate-data',
  });
  const router = useRouter();
  const {
    data: { org },
  } = useSession();
  const { data: duplicateData, isPending, error } = useCurrentEntityDuplicateData();
  const isSameTenantDataEmpty = !duplicateData?.sameTenant?.length;

  const columns = [
    { text: t('table.header.name'), width: '12%' },
    { text: t('table.header.fp-id'), width: '25%' },
    { text: t('table.header.exact-match'), width: '33%' },
    { text: t('table.header.status'), width: '13%' },
    { text: t('table.header.created-at'), width: '17%' },
  ];

  const handleRowClick = (duplicateDataItem: DuplicateDataItem) => {
    const fpId = duplicateDataItem?.fpId;
    if (!fpId) return;
    const basePath = router.asPath.split('/')[1];
    window.open(`/${basePath}/${fpId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Section title={t('title')}>
      <Table<DuplicateDataItem>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state', { orgName: org?.name ?? '' })}
        getKeyForRow={(duplicateDataItem: DuplicateDataItem) => duplicateDataItem.fpId}
        isLoading={isPending}
        items={duplicateData?.sameTenant}
        onRowClick={handleRowClick}
        renderTr={({ item }) => <Row duplicateDataItem={item} />}
      />
      {duplicateData?.otherTenant && (
        <OtherTenantSummary summary={duplicateData.otherTenant} isSameTenantDataEmpty={isSameTenantDataEmpty} />
      )}
    </Section>
  );
};

export default DuplicateData;
