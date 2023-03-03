import { ReviewStatus, UserStatus } from '@onefootprint/types';
import React, { useState } from 'react';
import useRefetchUser from 'src/pages/users/pages/user-details/hooks/use-refetch-user';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import ManualReviewDialog from './components/manual-review-dialog';
import ManualReviewOptionalButton from './components/manual-review-optional-button';
import ManualReviewRequiredButton from './components/manual-review-required-button';

const ManualReview = () => {
  const userId = useUserId();
  const { data } = useUser(userId);
  const refetchUser = useRefetchUser(userId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | undefined>();
  const shouldRender =
    data &&
    data.status !== UserStatus.vaultOnly &&
    data.status !== UserStatus.incomplete;

  const handleOpenDialog = (dialogStatus: ReviewStatus) => {
    setReviewStatus(dialogStatus);
    setDialogOpen(true);
  };

  const handleCloseDialog = (isComplete?: boolean) => {
    setDialogOpen(false);
    setReviewStatus(undefined);
    if (isComplete) {
      refetchUser();
    }
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
