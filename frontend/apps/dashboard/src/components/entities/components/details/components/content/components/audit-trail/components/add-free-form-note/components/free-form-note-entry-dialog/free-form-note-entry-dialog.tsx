import { useRequestErrorToast } from '@onefootprint/hooks';
import { OrgFrequentNoteKind } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ManualNoteFormData } from '@/entities/components/details/components/content/components/manual-note-entry-form';
import ManualNoteEntryForm from '@/entities/components/details/components/content/components/manual-note-entry-form';
import useEntityId from '@/entity/hooks/use-entity-id';

import useSubmitFreeFormNote from '../hooks/use-submit-free-form-note';

export type FreeFormNoteEntryDialogProps = {
  open: boolean;
  onClose: () => void;
};

const FreeFormNoteEntryDialog = ({ open, onClose }: FreeFormNoteEntryDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.free-form-note',
  });
  const showRequestErrorToast = useRequestErrorToast();
  const submitFreeFormMutation = useSubmitFreeFormNote();
  const entityId = useEntityId();

  const handleSubmit = (data: ManualNoteFormData) => {
    const { isPinned, note } = data;
    submitFreeFormMutation.mutate(
      {
        entityId,
        isPinned,
        note,
      },
      {
        onSuccess: onClose,
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      title={t('dialog.title')}
      primaryButton={{
        form: 'free-form-note-form',
        label: t('dialog.save'),
        loading: submitFreeFormMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('dialog.cancel'),
        onClick: onClose,
        disabled: submitFreeFormMutation.isLoading,
      }}
      onClose={onClose}
      open={open}
    >
      <ManualNoteEntryForm
        formId="free-form-note-form"
        placeholder={t('dialog.form.placeholder')}
        onSubmit={handleSubmit}
        frequentNoteKind={OrgFrequentNoteKind.Annotation}
      />
    </Dialog>
  );
};

export default FreeFormNoteEntryDialog;
