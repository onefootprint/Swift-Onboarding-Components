import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { OrgFrequentNoteKind, type ReviewStatus } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import type { ManualNoteFormData } from '@/entities/components/details/components/content/components/manual-note-entry-form';
import ManualNoteEntryForm from '@/entities/components/details/components/content/components/manual-note-entry-form';
import useEntityId from '@/entity/hooks/use-entity-id';

import useSubmitReview from './hooks/use-submit-review';

export type ManualReviewDialogProps = {
  open: boolean;
  onClose: () => void;
  status: ReviewStatus;
};

const ManualReviewDialog = ({
  open,
  onClose,
  status,
}: ManualReviewDialogProps) => {
  const { t } = useTranslation('pages.entity.manual-review');
  const showRequestErrorToast = useRequestErrorToast();
  const submitReviewMutation = useSubmitReview();
  const entityId = useEntityId();

  const handleSubmit = (data: ManualNoteFormData) => {
    const { isPinned, note } = data;
    submitReviewMutation.mutate(
      {
        entityId,
        status,
        annotation: {
          isPinned,
          note,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error: unknown) => {
          console.error(
            'Submitting manual review failed.',
            getErrorMessage(error),
          );
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
        form: 'manual-review-form',
        label: t('dialog.complete'),
        loading: submitReviewMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('dialog.cancel'),
        onClick: onClose,
        disabled: submitReviewMutation.isLoading,
      }}
      onClose={onClose}
      open={open}
    >
      <ManualNoteEntryForm
        formId="manual-review-form"
        prompt={t('dialog.form.prompt', { status: t(`status.${status}`) })}
        placeholder={t('dialog.form.placeholder')}
        onSubmit={handleSubmit}
        frequentNoteKind={OrgFrequentNoteKind.ManualReview}
      />
    </Dialog>
  );
};

export default ManualReviewDialog;
