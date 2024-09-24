import { useRequestErrorToast } from '@onefootprint/hooks';
import { type ActionRequest, ActionRequestKind, OrgFrequentNoteKind, type ReviewStatus } from '@onefootprint/types';
import { Dialog, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { ManualNoteFormData } from '@/entities/components/details/components/content/components/manual-note-entry-form';
import ManualNoteEntryForm from '@/entities/components/details/components/content/components/manual-note-entry-form';
import useEntityId from '@/entity/hooks/use-entity-id';

import useSubmitActions from '../../../../hooks/use-submit-actions';

export type ManualReviewDialogProps = {
  open: boolean;
  onClose: () => void;
  status: ReviewStatus;
};

const ManualReviewDialog = ({ open, onClose, status }: ManualReviewDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.manual-review',
  });
  const toast = useToast();
  const showRequestErrorToast = useRequestErrorToast();
  const submitActionsMutation = useSubmitActions();
  const entityId = useEntityId();

  const handleSubmit = (data: ManualNoteFormData) => {
    const { isPinned, note } = data;
    const action: ActionRequest = {
      kind: ActionRequestKind.manualDecision,
      status,
      annotation: {
        isPinned,
        note,
      },
    };
    submitActionsMutation.mutate(
      {
        entityId,
        actions: [action],
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onClose();
        },
        onError: showRequestErrorToast,
      },
    );
  };

  return (
    <Dialog
      size="compact"
      title={t('dialog.title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'manual-review-form',
        label: t('dialog.complete'),
        loading: submitActionsMutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('dialog.cancel'),
        onClick: onClose,
        disabled: submitActionsMutation.isPending,
      }}
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
