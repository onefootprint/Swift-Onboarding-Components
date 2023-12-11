import type { EntityStatus, ReviewStatus } from '@onefootprint/types';
import React, { useState } from 'react';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewOptionalButton from './components/manual-review-optional-button';
import ManualReviewRequiredButton from './components/manual-review-required-button';

type ManualReviewProps = {
  requiresManualReview: boolean;
  status: EntityStatus;
};
const ManualReview = ({ requiresManualReview, status }: ManualReviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();

  const handleOpenDialog = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewStatus(undefined);
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
