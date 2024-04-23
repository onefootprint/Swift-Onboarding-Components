'use client';

import { IcoFileText24 } from '@onefootprint/icons';
import {
  Box,
  Breadcrumb,
  Button,
  Stack,
  Text,
  useToast,
} from '@onefootprint/ui';
import Link from 'next/link';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Lang } from '@/app/types';
import { alertDecision, alertError, omitSearchParams } from '@/helpers';
import { useDialogManager } from '@/hooks';
import type { PartnerDocument } from '@/queries';
import {
  deletePartnerPartnershipsRequests,
  postPartnerPartnershipsDocuments,
  postPartnerPartnershipsDocumentsAssignments,
  postPartnerPartnershipsDocumentsReupload,
} from '@/queries';

import CompanyDocList from './components/company-doc-list';
import DialogAssign from './components/dialog-assign';
import DialogReSubmit from './components/dialog-re-submit';
import DialogRequestDocument from './components/dialog-request-document';
import DrawerTimeline from './components/drawer-timeline';
import Progress from './components/progress';
import Checks from './components/security-checks';

type Option = { label: string; value: string };

type CompanyPageContentProps = {
  documents: PartnerDocument[];
  documentsStatus: { accepted: number; count: number; percentage: number };
  lang: Lang;
  members: Option[];
  partnerId: string;
  partnerName: string;
  securityChecks: ComponentProps<typeof Checks>['securityChecks'];
  templatesUnused: Option[];
};

const resetBodyPointerEvents = () => {
  document.body.style.pointerEvents = '';
};

const hasAssignee = (x?: PartnerDocument): boolean =>
  Boolean(x?.partnerTenantAssignee?.id || x?.tenantAssignee?.id);

const doWithId =
  (noIdFn: () => unknown) =>
  (withIdFn: (id: string) => unknown) =>
  (id?: string) => (id ? withIdFn(id) : noIdFn());

const omitDecisionParam = (params: ReadonlyURLSearchParams) =>
  omitSearchParams(['rdecision'], params).toString();

const CompanyPageContent = ({
  documents,
  documentsStatus,
  lang,
  members,
  partnerId,
  partnerName,
  securityChecks,
  templatesUnused,
}: CompanyPageContentProps) => {
  const { t } = useTranslation('common');
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const dialog = useDialogManager();
  const refDecision = useRef(params.get('rdecision'));

  const docDialog = documents.find(x => x.id === dialog.id());
  const errorToast = alertError(t, toast.show);
  const decisionToast = alertDecision(t, toast.show);
  const alertOr = doWithId(() => errorToast(t('doc.missing-doc-id')));

  const onAssignClick = alertOr(id => dialog.add('assign', id));
  const onEditClick = alertOr(id => dialog.add('edit', id));
  const onReSubmitClick = alertOr(id => dialog.add('resubmit', id));
  const onRowClick = (doc: PartnerDocument) => dialog.add('timeline', doc.id);

  const onDeleteClick = alertOr((id: string) =>
    deletePartnerPartnershipsRequests(partnerId, id)
      .then(router.refresh)
      .catch(errorToast),
  );

  const goToDocView = (docId?: string, subId?: string) =>
    router.push(`/doc/${partnerId}/${docId}/${subId}?path=${path}`);

  /**
   * body pointer-events: none remains after closing
   * https://github.com/radix-ui/primitives/issues/1241
   * https://github.com/radix-ui/primitives/issues/1263
   * */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!dialog.has('timeline')) {
      window.setTimeout(resetBodyPointerEvents, 0);
    }
  }, [dialog]);

  useEffect(() => {
    if (!refDecision.current) return;

    decisionToast(refDecision.current);
    refDecision.current = null;
    router.replace(`${path}?${omitDecisionParam(params)}`);
  }, [refDecision.current]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Box tag="main">
        <Breadcrumb.List
          aria-label={t('companies.company-details-breadcrumb')}
          marginBottom={7}
        >
          <Breadcrumb.Item href="/app/companies" as={Link}>
            {t('companies.companies')}
          </Breadcrumb.Item>
          <Breadcrumb.Item>{partnerName}</Breadcrumb.Item>
        </Breadcrumb.List>
        <Stack tag="header" justify="space-between" align="center">
          <Stack gap={2}>
            <IcoFileText24 />
            <Text variant="label-2" tag="h2" lineHeight={1.5}>
              {t('documents')}
            </Text>
          </Stack>
          <Button
            variant="secondary"
            size="compact"
            onClick={() => dialog.add('additional')}
          >
            {t('doc.request-document')}
          </Button>
        </Stack>
        <Box marginBlock={5}>
          <Progress
            value={documentsStatus.percentage}
            details={`${documentsStatus.accepted}/${documentsStatus.count} ${t(
              'companies.completed-controls',
            )}`}
          />
        </Box>
        <Box marginBottom={8}>
          <CompanyDocList
            documents={documents}
            handlers={{
              onAssignClick,
              onDeleteClick,
              onEditClick,
              onReSubmitClick,
              onReviewClick: goToDocView,
              onRowClick,
              onViewClick: goToDocView,
            }}
            lang={lang}
          />
        </Box>
        <Checks securityChecks={securityChecks} />
      </Box>
      {dialog.has('additional') ? (
        <DialogRequestDocument
          isOpen
          onClose={dialog.reset}
          title={t('doc.request-document')}
          onSubmit={payload => {
            postPartnerPartnershipsDocuments(partnerId, payload)
              .then(router.refresh)
              .catch(errorToast);
            dialog.reset();
          }}
          options={templatesUnused}
        />
      ) : null}
      {dialog.has('edit') ? (
        <DialogRequestDocument
          isOpen
          title={t('modify-request')}
          docDialog={dialog.has('edit') ? docDialog : undefined}
          onClose={dialog.reset}
          onSubmit={({ id, name, description }) => {
            if (!id) {
              errorToast(t('doc.missing-doc-id'));
              return;
            }
            postPartnerPartnershipsDocumentsReupload(partnerId, id, {
              name,
              description,
            })
              .then(router.refresh)
              .catch(errorToast);
            dialog.reset();
          }}
          options={templatesUnused}
        />
      ) : null}
      {dialog.has('resubmit') ? (
        <DialogReSubmit
          docDialog={dialog.has('resubmit') ? docDialog : undefined}
          isOpen
          onClose={dialog.reset}
          onSubmit={({ id, name, description }) => {
            postPartnerPartnershipsDocumentsReupload(partnerId, id, {
              name,
              description,
            })
              .then(router.refresh)
              .catch(errorToast);
            dialog.reset();
          }}
        />
      ) : null}
      {dialog.has('assign') ? (
        <DialogAssign
          docId={dialog.id()}
          isOpen
          onClose={dialog.reset}
          onSubmit={({ docId, userId }) => {
            dialog.reset();
            postPartnerPartnershipsDocumentsAssignments(
              partnerId,
              docId,
              userId,
            )
              .then(router.refresh)
              .catch(errorToast);
          }}
          options={
            hasAssignee(docDialog)
              ? [{ label: t('unassign'), value: '' }].concat(members)
              : members
          }
        />
      ) : null}
      <DrawerTimeline
        docId={dialog.id()}
        docStatus={docDialog?.status || ''}
        isOpen={dialog.has('timeline')}
        lang={lang}
        onClose={dialog.reset}
        onViewSubmissionClick={goToDocView}
        partnerId={partnerId}
      />
    </>
  );
};

export default CompanyPageContent;
