import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import { Box, Dropdown, Table } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { SyntheticEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocument } from '@/config/types';

type T = TFunction<'common'>;
type Props = { documents: PartnerDocument[] };

const noop = () => undefined;
const stopPropagation = (e: SyntheticEvent<unknown>) => e.stopPropagation();
const getTableColumns = (t: T) => [
  { text: t('document'), width: '35%' },
  { text: t('status'), width: '20%' },
  { text: t('assigned-to'), width: '15%' },
  { text: t('last-activity'), width: '15%' },
  { text: '', width: '15%' },
];

const CompanyDocumentList = ({ documents }: Props) => {
  const { t } = useTranslation('common');

  const handleSearchChange = (searchText: string) => {
    // TODO: Implement search
    // eslint-disable-next-line no-console
    console.log(searchText);
  };

  return (
    <Table<PartnerDocument>
      aria-label={t('companies.document-table-aria-label')}
      columns={getTableColumns(t)}
      emptyStateText={t('companies.document-empty-state')}
      getAriaLabelForRow={(item: PartnerDocument) => item.name}
      getKeyForRow={(item: PartnerDocument) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={documents}
      onChangeSearchText={handleSearchChange}
      renderTr={renderTr(t)}
      searchPlaceholder={t('search-placeholder')}
    />
  );
};

const renderTr = (t: T) =>
  function Tr({ item }: TableRow<PartnerDocument>) {
    return (
      <>
        <td>{item.name}</td>
        <td>{item.status}</td>
        <td>{item.assignedTo ? item.assignedTo.name : '--'}</td>
        <td>{item.lastUpdated}</td>
        <Box tag="td" display="grid" justifyContent="end" alignItems="center">
          <Dropdown.Root>
            <Dropdown.Trigger
              aria-label={`${t('open-actions-for')} ${item.name}`}
            >
              <IcoDotsHorizontal24 />
            </Dropdown.Trigger>
            <Dropdown.Content align="end">
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('review')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('assign')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('download')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('see-document-timeline')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('edit-configuration')}
              </Dropdown.Item>
              <Dropdown.Item onSelect={noop} onClick={stopPropagation}>
                {t('view')}
              </Dropdown.Item>
              <Dropdown.Item
                onSelect={noop}
                onClick={stopPropagation}
                variant="destructive"
              >
                {t('request-reupload')}
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </Box>
      </>
    );
  };

export default CompanyDocumentList;
