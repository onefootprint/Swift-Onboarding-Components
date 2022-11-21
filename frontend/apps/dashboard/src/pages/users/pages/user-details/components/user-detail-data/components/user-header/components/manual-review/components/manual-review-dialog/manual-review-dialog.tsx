import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { ReviewStatus } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';
import { stringifyAnnotationNote } from 'src/pages/users/pages/user-details/components/user-detail-data/utils/annotation-note-utils';
import { User } from 'src/pages/users/types/user.types';

import ManualReviewForm, {
  ManualReviewFormData,
} from './components/manual-review-form';
import useSubmitReview from './hooks/use-submit-review';

export type ManualReviewDialogProps = {
  user: User;
  open: boolean;
  onClose: () => void;
  status: ReviewStatus;
};

const ManualReviewDialog = ({
  user,
  open,
  onClose,
  status,
}: ManualReviewDialogProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const showRequestErrorToast = useRequestErrorToast();
  const submitReviewMutation = useSubmitReview();

  const handleSubmit = (data: ManualReviewFormData) => {
    const { reason, isPinned, note } = data;
    submitReviewMutation.mutate(
      {
        footprintUserId: user.id,
        status,
        annotation: {
          isPinned,
          note: stringifyAnnotationNote({ reason, note }),
        },
      },
      {
        onSuccess: () => {
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
      <ManualReviewForm status={status} onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ManualReviewDialog;
