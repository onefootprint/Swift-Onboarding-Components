import { getErrorMessage } from '@onefootprint/request';
import { Table } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentEntityDuplicateData from 'src/components/entities/components/details/hooks/use-current-entity-duplicate-data';

import Section from '../section';
import type { DuplicateDataTableRowItem } from './components/row';
import Row from './components/row';

const DuplicateData = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.duplicate-data',
  });
  const router = useRouter();
  const {
    data: duplicateData,
    isLoading,
    error,
  } = useCurrentEntityDuplicateData();

  const columns = [
    { text: t('table.header.name'), width: '16%' },
    { text: t('table.header.fp-id'), width: '25%' },
    { text: t('table.header.exact-match'), width: '25%' },
    { text: t('table.header.status'), width: '17%' },
    { text: t('table.header.created-at'), width: '17%' },
  ];

  const getFpId = (duplicateDataItem: DuplicateDataTableRowItem) => {
    if ('sameTenant' in duplicateDataItem) {
      return duplicateDataItem.sameTenant?.fpId;
    }
    return undefined;
  };

  const handleRowClick = (duplicateDataItem: DuplicateDataTableRowItem) => {
    const fpId = getFpId(duplicateDataItem);
    if (!fpId) return;
    const basePath = router.asPath.split('/')[1];
    window.open(`/${basePath}/${fpId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Section title={t('title')}>
      <Table<DuplicateDataTableRowItem>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={error ? getErrorMessage(error) : t('table.empty-state')}
        getKeyForRow={(duplicateDataItem: DuplicateDataTableRowItem) => {
          if ('sameTenant' in duplicateDataItem) {
            return duplicateDataItem.sameTenant?.fpId ?? 'same-tenant';
          }
          return 'other-tenants';
        }}
        isLoading={isLoading}
        items={duplicateData}
        onRowClick={handleRowClick}
        renderTr={({ item }) => <Row duplicateDataTableRowItem={item} />}
      />
    </Section>
  );
};

export default DuplicateData;
