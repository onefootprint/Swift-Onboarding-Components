import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { TableRow } from '@onefootprint/ui';
import { Box, Dropdown, Table, Text, useConfirmationDialog } from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { SyntheticEvent } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Lang } from '@/app/types';
import { confirmDocSubmission, dateFormatter, getDocStatus, getOr, searchByPaths } from '@/helpers';
import { LangFallback } from '@/i18n';
import type { PartnerDocument } from '@/queries/get-partner-partnerships-documents';

type T = TFunction<'common'>;
type Maybe<I> = I | undefined;
type WithConfirm = ReturnType<typeof confirmDocSubmission>;
type Handlers = {
  onAssignClick: (id?: string) => void;
  onDeleteClick: (id?: string) => void;
  onEditClick: (id?: string) => void;
  onReSubmitClick: (id?: string) => void;
  onReviewClick: (docId?: string, subId?: string) => void;
  onRowClick: (doc: PartnerDocument) => void;
  onViewClick: (docId?: string, subId?: string) => void;
};
type CompanyDocListProps = {
  documents: PartnerDocument[];
  handlers: Handlers;
  lang: Lang | undefined;
};

const join = (...args: unknown[]): string => args.filter(Boolean).join(' ');
const stopPropagation = (e: SyntheticEvent<unknown>) => e.stopPropagation();
const toLowercase = (x: string) => String(x).toLowerCase();
const noUnderscore = (x: string) => String(x).replace(/[_-]/g, '');
const normalizeStr = (x: string) => toLowercase(noUnderscore(x));
const getDataId = getOr<Maybe<string>>(undefined, 'target.dataset.id');
const getDataSubId = getOr<Maybe<string>>(undefined, 'target.dataset.subId');
const isAccepted = (x: string) => normalizeStr(x) === 'accepted';
const isNotRequested = (x: string) => normalizeStr(x) === 'notrequested';
const isRejected = (x: string) => normalizeStr(x) === 'rejected';
const isWaitingForReview = (x: string) => normalizeStr(x) === 'waitingforreview';

const getAssignedTo = ({ partnerTenantAssignee, tenantAssignee }: PartnerDocument): string => {
  if (partnerTenantAssignee) return join(partnerTenantAssignee.firstName, partnerTenantAssignee.lastName).trim();

  if (tenantAssignee) {
    return join(tenantAssignee.firstName, tenantAssignee.lastName).trim();
  }

  return '--';
};

const getTableColumns = (t: T) => [
  { text: t('document'), width: '35%' },
  { text: t('status'), width: '20%' },
  { text: t('assigned-to'), width: '19%' },
  { text: t('last-activity'), width: '19%' },
  { text: '', width: '8%' },
];

const clientSearch = searchByPaths<PartnerDocument>([
  'name',
  'description',
  'status',
  'partnerTenantAssignee.firstName',
  'partnerTenantAssignee.lastName',
  'tenantAssignee.firstName',
  'tenantAssignee.lastName',
]);

const CompanyDocList = ({ documents, handlers, lang = LangFallback }: CompanyDocListProps) => {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState<string>('');
  const confirmationDialog = useConfirmationDialog();
  const withConfirm = confirmDocSubmission(t, confirmationDialog.open);

  return (
    <Table<PartnerDocument>
      aria-label={t('companies.document-table-aria-label')}
      columns={getTableColumns(t)}
      emptyStateText={t('companies.document-empty-state')}
      getAriaLabelForRow={(item: PartnerDocument) => item.name}
      getKeyForRow={(item: PartnerDocument) => item.id}
      hasRowEmphasis={() => true}
      initialSearch=""
      items={clientSearch(documents, search)}
      onChangeSearchText={setSearch}
      onRowClick={handlers.onRowClick}
      renderTr={renderTr(t, lang, handlers, withConfirm)}
      searchPlaceholder={t('search-placeholder')}
    />
  );
};

const renderTr = (t: T, lang: Lang, handlers: Handlers, withConfirm: WithConfirm) =>
  function Tr({ item }: TableRow<PartnerDocument>) {
    const status = getDocStatus(t, item.status);
    return (
      <>
        <td>{item.name}</td>
        <td>
          <Text tag="span" variant="body-3" color={status.color}>
            {status.text}
          </Text>
        </td>
        <td>{getAssignedTo(item)}</td>
        <td>{dateFormatter(lang, item.lastUpdated)}</td>
        {isNotRequested(item.status) ? (
          <Box tag="td" display="grid" justifyContent="end" alignItems="center">
            <Dropdown.Root>
              <Dropdown.Trigger aria-label={`${t('open-actions-for')} ${item.name}`}>
                <IcoDotsHorizontal24 />
              </Dropdown.Trigger>
              <Dropdown.Content align="end">
                <Dropdown.Item
                  data-id={item.id}
                  onClick={stopPropagation}
                  onSelect={e => handlers.onReSubmitClick(getDataId(e))}
                >
                  {t('doc.request-new-submission')}
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Root>
          </Box>
        ) : (
          <Box tag="td" display="grid" justifyContent="end" alignItems="center">
            <Dropdown.Root>
              <Dropdown.Trigger aria-label={`${t('open-actions-for')} ${item.name}`}>
                <IcoDotsHorizontal24 />
              </Dropdown.Trigger>
              <Dropdown.Content align="end">
                {isAccepted(item.status) ? (
                  <Dropdown.Item
                    data-id={item.id}
                    data-sub-id={item.activeSubmissionId}
                    onClick={stopPropagation}
                    onSelect={e => handlers.onViewClick(getDataId(e), getDataSubId(e))}
                  >
                    {t('view')}
                  </Dropdown.Item>
                ) : null}
                {isWaitingForReview(item.status) ? (
                  <Dropdown.Item
                    data-id={item.id}
                    data-sub-id={item.activeSubmissionId}
                    onClick={stopPropagation}
                    onSelect={e => handlers.onReviewClick(getDataId(e), getDataSubId(e))}
                  >
                    {t('review')}
                  </Dropdown.Item>
                ) : null}
                {isAccepted(item.status) ? null : (
                  <Dropdown.Item
                    data-id={item.id}
                    onClick={stopPropagation}
                    onSelect={e => handlers.onAssignClick(getDataId(e))}
                  >
                    {t('assign')}
                  </Dropdown.Item>
                )}
                {isAccepted(item.status) || isWaitingForReview(item.status) ? null : (
                  <Dropdown.Item
                    data-id={item.id}
                    onClick={stopPropagation}
                    onSelect={e => handlers.onEditClick(getDataId(e))}
                  >
                    {t('modify-request')}
                  </Dropdown.Item>
                )}
                {isAccepted(item.status) || isWaitingForReview(item.status) ? null : (
                  <Dropdown.Item
                    data-id={item.activeRequestId}
                    onClick={stopPropagation}
                    onSelect={withConfirm(item.name, e => handlers.onDeleteClick(getDataId(e)))}
                    variant="destructive"
                  >
                    {t('doc.cancel-submission')}
                  </Dropdown.Item>
                )}
                {isAccepted(item.status) || isRejected(item.status) || isWaitingForReview(item.status) ? (
                  <Dropdown.Item
                    data-id={item.id}
                    onClick={stopPropagation}
                    onSelect={e => handlers.onReSubmitClick(getDataId(e))}
                  >
                    {t('doc.request-new-submission')}
                  </Dropdown.Item>
                ) : null}
              </Dropdown.Content>
            </Dropdown.Root>
          </Box>
        )}
      </>
    );
  };

export default CompanyDocList;
