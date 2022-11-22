import { useTranslation } from '@onefootprint/hooks';
import { OnboardingStatus, ReviewStatus } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import { User } from 'src/pages/users/types/user.types';

import useGetPinnedAnnotations from '../../../../hooks/use-get-pinned-annotations';
import useGetTimeline from '../../../audit-trail/hooks/use-get-timeline';
import ManualReviewDialog from './components/manual-review-dialog';

type ManualReviewProps = {
  user: User;
};

const ManualReview = ({ user }: ManualReviewProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const [dialogOpen, setDialogOpen] = useState(false);
  const pinnedNotesQuery = useGetPinnedAnnotations();
  const auditTrailQuery = useGetTimeline();
  const { status } = user;
  if (status === OnboardingStatus.vaultOnly) {
    return null;
  }

  const reviewStatus =
    status === OnboardingStatus.failed ? ReviewStatus.pass : ReviewStatus.fail;
  return (
    <>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        {reviewStatus === ReviewStatus.pass
          ? t('button.mark-as-verified')
          : t('button.mark-as-failed')}
      </Button>
      {dialogOpen && (
        <ManualReviewDialog
          status={reviewStatus}
          open={dialogOpen}
          onClose={(isComplete?: boolean) => {
            setDialogOpen(false);
            if (isComplete) {
              pinnedNotesQuery.refetch();
              auditTrailQuery.refetch();
            }
          }}
        />
      )}
    </>
  );
};

export default ManualReview;
