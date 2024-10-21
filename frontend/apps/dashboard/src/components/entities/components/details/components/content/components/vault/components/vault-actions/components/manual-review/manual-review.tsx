import type { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { useState } from 'react';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewTrigger from './components/manual-review-trigger';

export type ManualReviewProps = {
  kind: EntityKind;
  status: EntityStatus;
  disabled?: boolean;
};

const ManualReview = ({ kind, status, disabled }: ManualReviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const shouldShowDialog = dialogOpen && reviewStatus;

  const handleSelect = (dialogStatus: ReviewStatus) => {
    setDropdownOpen(false);
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReviewStatus(undefined);
  };

  return (
    <>
      <ManualReviewTrigger
        status={status}
        kind={kind}
        onSelect={handleSelect}
        disabled={disabled}
        onOpenChange={setDropdownOpen}
        open={dropdownOpen}
      />
      {shouldShowDialog && (
        <ManualReviewDialog kind={kind} status={reviewStatus} open={dialogOpen} onClose={handleCloseDialog} />
      )}
    </>
  );
};

export default ManualReview;
