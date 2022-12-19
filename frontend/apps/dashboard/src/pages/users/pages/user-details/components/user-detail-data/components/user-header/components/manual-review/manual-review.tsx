import { OnboardingStatus, ReviewStatus } from '@onefootprint/types';
import React, { useState } from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewOptionalButton from './components/manual-review-optional-button';
import ManualReviewRequiredButton from './components/manual-review-required-button';

const ManualReview = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const userId = useUserId();
  const {
    user: { metadata },
    refresh,
  } = useUser(userId);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  if (!metadata) {
    return null;
  }

  const { status, requiresManualReview } = metadata;
  if (status === OnboardingStatus.vaultOnly) {
    return null;
  }

  const handleOpenDialog = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = (isComplete?: boolean) => {
    setDialogOpen(false);
    setReviewStatus(undefined);
    if (isComplete) {
      refresh();
    }
  };

  return (
    <>
      {requiresManualReview ? (
        <ManualReviewRequiredButton
          status={status}
          onOpenDialog={handleOpenDialog}
        />
      ) : (
        <ManualReviewOptionalButton
          status={status}
          onOpenDialog={handleOpenDialog}
        />
      )}
      {dialogOpen && reviewStatus && (
        <ManualReviewDialog
          status={reviewStatus}
          open={dialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default ManualReview;
