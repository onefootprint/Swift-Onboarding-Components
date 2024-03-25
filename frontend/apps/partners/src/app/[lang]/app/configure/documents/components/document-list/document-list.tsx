import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { Box, IconButton, Table, type TableRow } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocumentTemplate } from '@/config/types';

type T = TFunction<'common'>;
type ListProps = { templates: PartnerDocumentTemplate[] };

const getColumns = (t: T) => [
  { text: t('document'), width: '35%' },
  { text: t('file-format'), width: '20%' },
  { text: t('frequency'), width: '15%' },
  { text: t('modified'), width: '15%' },
  { text: '', width: '15%' },
];

const DocumentList = ({ templates }: ListProps) => {
  const { t } = useTranslation('common');

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

  return (
    <Table<PartnerDocumentTemplate>
      aria-label={t('doc.document-table-aria-label')}
      columns={getColumns(t)}
      emptyStateText={t('doc.document-empty-state')}
      getAriaLabelForRow={(item: PartnerDocumentTemplate) => item.name}
      getKeyForRow={(item: PartnerDocumentTemplate) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={templates}
      onChangeSearchText={handleSearchChange}
      renderTr={renderTr(t)}
      searchPlaceholder={t('search-placeholder')}
    />
  );
};

const renderTr = (t: T) =>
  function Tr({ item }: TableRow<PartnerDocumentTemplate>) {
    return (
      <>
        <td>{item.name}</td>
        <td>{item.format}</td>
        <td>{item.frequency}</td>
        <td>{item.lastUpdated}</td>
        <Box tag="td" display="grid" justifyContent="end" alignItems="center">
          <IconButton aria-label={`${t('open-actions-for')} ${item.name}`}>
            <IcoDotsHorizontal24 />
          </IconButton>
        </Box>
      </>
    );
  };

export default DocumentList;
