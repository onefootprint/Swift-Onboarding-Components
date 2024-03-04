import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Box, IconButton, Table, type TableRow } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocument } from '@/config/types';

type ListProps = {
  documents: PartnerDocument[];
};

const List = ({ documents }: ListProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-keys' });
  const columns = [
    { text: t('table.header.name'), width: '35%' },
    { text: t('table.header.status'), width: '20%' },
    { text: t('table.header.assigned-to'), width: '15%' },
    { text: t('table.header.last-activity'), width: '15%' },
    { text: '', width: '15%' },
  ];

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

  return (
    <Table<PartnerDocument>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={t('table.empty-state')}
      getAriaLabelForRow={(item: PartnerDocument) => item.name}
      getKeyForRow={(item: PartnerDocument) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={documents}
      onChangeSearchText={handleSearchChange}
      renderTr={renderTr}
      searchPlaceholder="search"
    />
  );
};

const renderTr = ({ item }: TableRow<PartnerDocument>) => (
  <>
    <td>{item.name}</td>
    <td>{item.status}</td>
    <td>{item.assignedTo ? item.assignedTo.name : '--'}</td>
    <td>{item.lastUpdated}</td>
    <Box tag="td" display="grid" justifyContent="end" alignItems="center">
      <IconButton aria-label={`Open actions for ${item.name}`}>
        <IcoDotsHorizontal24 />
      </IconButton>
    </Box>
  </>
);

export default List;
