import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Box, IconButton, Table, type TableRow } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocumentTemplate } from '@/config/types';

type ListProps = {
  templates: PartnerDocumentTemplate[];
};

const List = ({ templates }: ListProps) => {
  const { t } = useTranslation('templates', { keyPrefix: 'list' });
  const columns = [
    { text: t('table.header.name'), width: '35%' },
    { text: t('table.header.format'), width: '20%' },
    { text: t('table.header.frequency'), width: '15%' },
    { text: t('table.header.last-activity'), width: '15%' },
    { text: '', width: '15%' },
  ];

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

  return (
    <Table<PartnerDocumentTemplate>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getAriaLabelForRow={(item: PartnerDocumentTemplate) => item.name}
      getKeyForRow={(item: PartnerDocumentTemplate) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={templates}
      onChangeSearchText={handleSearchChange}
      renderTr={renderTr}
      searchPlaceholder="search"
    />
  );
};

const renderTr = ({ item }: TableRow<PartnerDocumentTemplate>) => (
  <>
    <td>{item.name}</td>
    <td>{item.format}</td>
    <td>{item.frequency}</td>
    <td>{item.lastUpdated}</td>
    <Box tag="td" display="grid" justifyContent="end" alignItems="center">
      <IconButton aria-label={`Open actions for ${item.name}`}>
        <IcoDotsHorizontal24 />
      </IconButton>
    </Box>
  </>
);

export default List;
