import { getErrorMessage } from '@onefootprint/request';
import { Box, Table, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useCurrentEntityDuplicateData from 'src/components/entities/components/details/hooks/use-current-entity-duplicate-data';
import styled, { css } from 'styled-components';

import type { DuplicateDataTableRowItem } from './components/row';
import Row from './components/row';

const DuplicateData = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.duplicate-data',
  });
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

  return (
    <Container>
      <Text variant="label-3">{t('title')}</Text>
      <Box>
        <Table<DuplicateDataTableRowItem>
          aria-label={t('table.aria-label')}
          columns={columns}
          emptyStateText={
            error ? getErrorMessage(error) : t('table.empty-state')
          }
          getKeyForRow={(duplicateDataItem: DuplicateDataTableRowItem) => {
            if ('sameTenant' in duplicateDataItem) {
              return duplicateDataItem.sameTenant?.fpId ?? 'same-tenant';
            }
            return 'other-tenants';
          }}
          isLoading={isLoading}
          items={duplicateData}
          renderTr={({ item }) => <Row duplicateDataTableRowItem={item} />}
        />
      </Box>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `};
`;

export default DuplicateData;
