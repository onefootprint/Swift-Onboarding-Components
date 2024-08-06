import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import { Box, Dropdown, Table, useConfirmationDialog } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Lang } from '@/app/types';
import type { WithConfirm } from '@/helpers';
import { confirmDeletion, dateFormatter, getOr, searchByPaths } from '@/helpers';
import type { DocTemplate } from '@/queries/get-partner-doc-templates';

type T = TFunction<'common'>;
type Handle = (id?: string) => void;
type Handlers = { onDeleteClick: Handle; onEditClick: Handle };
type ListProps = { handlers: Handlers; lang: Lang; templates: DocTemplate[] };

const stopPropagation = (e: SyntheticEvent<unknown>) => e.stopPropagation();
const getDataId = getOr<undefined | string>(undefined, 'target.dataset.id');
const clientSearch = searchByPaths<DocTemplate>(['latestVersion.name', 'latestVersion.description']);

const getTableColumns = (t: T) => [
  { text: t('document'), width: '35%' },
  { text: t('modified'), width: '15%' },
  { text: '', width: '15%' },
];

const DocumentList = ({ handlers, lang, templates }: ListProps) => {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState<string>('');
  const confirmationDialog = useConfirmationDialog();
  const withConfirm = confirmDeletion(t, confirmationDialog.open);

  return (
    <Table<DocTemplate>
      aria-label={t('doc.document-table-aria-label')}
      columns={getTableColumns(t)}
      emptyStateText={t('doc.document-empty-state')}
      getAriaLabelForRow={(item: DocTemplate) => item.latestVersion.name}
      getKeyForRow={(item: DocTemplate) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={clientSearch(templates, search)}
      onChangeSearchText={setSearch}
      renderTr={renderTr(t, lang, handlers, withConfirm)}
      searchPlaceholder={t('search-placeholder')}
    />
  );
};

const renderTr = (t: T, lang: Lang, handlers: Handlers, withConfirm: WithConfirm) =>
  function Tr({ item }: TableRow<DocTemplate>) {
    return (
      <>
        <td>{item.latestVersion.name}</td>
        <td>{dateFormatter(lang, item.latestVersion.createdAt)}</td>
        <Box tag="td" display="grid" justifyContent="end" alignItems="center">
          <Dropdown.Root>
            <Dropdown.Trigger aria-label={`${t('open-actions-for')} ${item.latestVersion.name}`}>
              <IcoDotsHorizontal24 />
            </Dropdown.Trigger>
            <Dropdown.Content align="end">
              <Dropdown.Item
                data-id={item.id}
                onSelect={e => handlers.onEditClick(getDataId(e))}
                onClick={stopPropagation}
              >
                {t('edit')}
              </Dropdown.Item>
              <Dropdown.Item
                data-id={item.id}
                onSelect={withConfirm(e => handlers.onDeleteClick(getDataId(e)))}
                onClick={stopPropagation}
                variant="destructive"
              >
                {t('delete')}
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Root>
        </Box>
      </>
    );
  };

export default DocumentList;
