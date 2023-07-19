import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import ManualNoteEntryForm, {
  ManualNoteFormData,
} from '@/entities/components/details/components/content/components/manual-note-entry-form';
import useEntityId from '@/entity/hooks/use-entity-id';

import useSubmitFreeFormNote from '../hooks/use-submit-free-form-note';

export type FreeFormNoteEntryDialogProps = {
  open: boolean;
  onClose: () => void;
};

const FreeFormNoteEntryDialog = ({
  open,
  onClose,
}: FreeFormNoteEntryDialogProps) => {
  const { t } = useTranslation('pages.entity.audit-trail.free-form-note');
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
        onError: showRequestErrorToast,
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
      />
    </Dialog>
  );
};

export default FreeFormNoteEntryDialog;
