import { EntityStatus, ReviewStatus } from '@onefootprint/types';
import React, { useState } from 'react';

import useCurrentEntity from '@/entity/hooks/use-current-entity';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewOptionalButton from './components/manual-review-optional-button';
import ManualReviewRequiredButton from './components/manual-review-required-button';

const ManualReview = () => {
  const { data } = useCurrentEntity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const shouldRender =
    data &&
    data.status !== EntityStatus.none &&
    data.status !== EntityStatus.incomplete;

  const handleOpenDialog = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewStatus(undefined);
  };

  return shouldRender ? (
    <>
      {data.requiresManualReview ? (
        <ManualReviewRequiredButton
          status={data.status}
          onOpenDialog={handleOpenDialog}
        />
      ) : (
        <ManualReviewOptionalButton
          status={data.status}
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
  ) : null;
};

export default ManualReview;
