import { useTranslation } from '@onefootprint/hooks';
import { ReviewStatus, UserStatus } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';

type ManualReviewOptionalButtonProps = {
  status: UserStatus;
  onOpenDialog: (reviewStatus: ReviewStatus) => void;
};

const ManualReviewOptionalButton = ({
  status,
  onOpenDialog,
}: ManualReviewOptionalButtonProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const reviewStatus =
    status === UserStatus.failed ? ReviewStatus.pass : ReviewStatus.fail;

  const handleClick = () => {
    onOpenDialog(reviewStatus);
  };

  return (
    <Button size="small" variant="secondary" onClick={handleClick}>
      {reviewStatus === ReviewStatus.pass
        ? t('button.mark-as-verified')
        : t('button.mark-as-failed')}
    </Button>
  );
};

export default ManualReviewOptionalButton;
