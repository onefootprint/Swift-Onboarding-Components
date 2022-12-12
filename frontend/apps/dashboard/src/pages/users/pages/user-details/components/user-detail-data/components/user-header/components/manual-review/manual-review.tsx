import { OnboardingStatus, ReviewStatus } from '@onefootprint/types';
import React, { useState } from 'react';
import { User } from 'src/pages/users/types/user.types';

import useGetPinnedAnnotations from '../../../../hooks/use-get-pinned-annotations';
import useGetTimeline from '../../../audit-trail/hooks/use-get-timeline';
import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewOptionalButton from './components/manual-review-optional-button';
import ManualReviewRequiredButton from './components/manual-review-required-button';

type ManualReviewProps = {
  user: User;
};

const ManualReview = ({ user }: ManualReviewProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const pinnedNotesQuery = useGetPinnedAnnotations();
  const auditTrailQuery = useGetTimeline();
  const { status, requiresManualReview } = user;
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
      pinnedNotesQuery.refetch();
      auditTrailQuery.refetch();
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
