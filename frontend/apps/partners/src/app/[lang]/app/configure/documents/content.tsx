'use client';

import { Button, Divider, Stack, Text, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Lang } from '@/app/types';
import { DEFAULT_PUBLIC_ROUTE } from '@/config/constants';
import { alertError } from '@/helpers';
import { useClientStore } from '@/hooks';
import { deletePartnerDocTemplates, postPartnerDocTemplates, putPartnerDocTemplates } from '@/queries';
import type { DocTemplate } from '@/queries/get-partner-doc-templates';

import DialogAddDocument from './components/dialog-add-document';
import List from './components/document-list';

type PostDocParameters = Parameters<typeof postPartnerDocTemplates>;
type DocPayload = PostDocParameters['0'] & { id?: string };
type AddDocDialog = DocPayload & { isOpen: boolean };
type ConfigureDocumentsContentProps = { lang: Lang; templates: DocTemplate[] };

const EmptyDoc: DocPayload = { name: '', description: '' };
const initState: AddDocDialog = { isOpen: false, ...EmptyDoc };

const ConfigureDocumentsContent = ({ lang, templates }: ConfigureDocumentsContentProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { data } = useClientStore(x => x);
  const toast = useToast();
  const [addDocDialog, setAddDocDialog] = useState<AddDocDialog>(initState);
  const authToken = data.auth;
  const errorToast = alertError(t, toast.show);

  const handleDocDeletion = useCallback(
    (id: string) =>
      !authToken
        ? router.push(DEFAULT_PUBLIC_ROUTE)
        : deletePartnerDocTemplates(id).then(router.refresh).catch(errorToast),
    [authToken, errorToast, router],
  );

  const handleDocSubmit = useCallback(
    ({ id, ...payload }: DocPayload) => {
      if (!authToken) return router.push(DEFAULT_PUBLIC_ROUTE);
      return id
        ? putPartnerDocTemplates(payload, id).then(router.refresh).catch(errorToast)
        : postPartnerDocTemplates(payload).then(router.refresh).catch(errorToast);
    },
    [authToken, errorToast, router],
  );

  return (
    <>
      <Stack gap={2} marginBottom={7} direction="column">
        <Text variant="heading-2">{t('documents')}</Text>
        <Text variant="body-2" color="secondary">
          {t('doc.docs-to-stay-compliant')}
        </Text>
      </Stack>
      <Stack justifyContent="space-between" align="center">
        <Stack gap={2} direction="column">
          <Text variant="label-1">{t('doc.documents-template')}</Text>
          <Text variant="body-3" color="secondary" maxWidth="770px">
            {t('doc.documents-template-overview')}
          </Text>
        </Stack>
        <Button onClick={() => setAddDocDialog({ ...EmptyDoc, isOpen: true })} size="compact" variant="secondary">
          {t('doc.add-document')}
        </Button>
      </Stack>
      <Divider marginTop={5} marginBottom={7} />
      <List
        lang={lang}
        templates={templates}
        handlers={{
          onDeleteClick: (id?: string) => (!id ? errorToast(t('doc.missing-doc-id')) : handleDocDeletion(id)),
          onEditClick: (id?: string) => {
            if (!id) return errorToast(t('doc.missing-doc-id'));

            const found = templates.find(x => x.id === id);
            const { name, description } = found?.latestVersion || EmptyDoc;
            return setAddDocDialog({ isOpen: true, id, name, description });
          },
        }}
      />
      <DialogAddDocument
        initialValues={addDocDialog}
        isOpen={addDocDialog.isOpen}
        onClose={() => setAddDocDialog({ ...EmptyDoc, isOpen: false })}
        onSubmit={({ name, description }) => {
          const { id } = addDocDialog;
          handleDocSubmit({ id, name, description });
          setAddDocDialog({ ...EmptyDoc, isOpen: false });
        }}
      />
    </>
  );
};

export default ConfigureDocumentsContent;
