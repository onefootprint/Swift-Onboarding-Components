import type { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import React, { useState } from 'react';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewTrigger from './components/manual-review-trigger';

export type ManualReviewProps = {
  kind: EntityKind;
  status: EntityStatus;
  disabled?: boolean;
};

const ManualReview = ({ kind, status, disabled }: ManualReviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const shouldShowDialog = dialogOpen && reviewStatus;

  const handleSelect = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewStatus(undefined);
  };

  return (
    <>
      <ManualReviewTrigger status={status} kind={kind} onSelect={handleSelect} disabled={disabled} />
      {shouldShowDialog && <ManualReviewDialog status={reviewStatus} open={dialogOpen} onClose={handleCloseDialog} />}
    </>
  );
};

export default ManualReview;
