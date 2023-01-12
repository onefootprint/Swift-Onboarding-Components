import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { ReviewStatus } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import useUserId from '../../../../../../../../hooks/use-user-id/use-user-id';
import ManualReviewForm, {
  ManualReviewFormData,
} from './components/manual-review-form';
import useSubmitReview from './hooks/use-submit-review';

export type ManualReviewDialogProps = {
  open: boolean;
  onClose: (isComplete?: boolean) => void;
  status: ReviewStatus;
};

const ManualReviewDialog = ({
  open,
  onClose,
  status,
}: ManualReviewDialogProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const showRequestErrorToast = useRequestErrorToast();
  const submitReviewMutation = useSubmitReview();
  const footprintUserId = useUserId();

  const handleSubmit = (data: ManualReviewFormData) => {
    const { isPinned, note } = data;
    submitReviewMutation.mutate(
      {
        footprintUserId,
        status,
        annotation: {
          isPinned,
          note,
        },
      },
      {
        onSuccess: () => {
          onClose(true);
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
