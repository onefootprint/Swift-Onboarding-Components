import { useTranslation } from '@onefootprint/hooks';
import { UserStatus } from '@onefootprint/types';
import { InlineAlert, LinkButton } from '@onefootprint/ui';
import React from 'react';

type ManualReviewBannerProps = {
  status: UserStatus;
  onClickAuditTrailLink?: () => void;
};

const ManualReviewBanner = ({
  status,
  onClickAuditTrailLink,
}: ManualReviewBannerProps) => {
  const { t } = useTranslation(
    'components.private-layout.manual-review-banner',
  );
  if (status === UserStatus.vaultOnly) {
    return null;
  }

  return (
    <InlineAlert variant={status === UserStatus.failed ? 'error' : 'warning'}>
      {status === UserStatus.failed
        ? t('failed-needs-review')
        : t('verified-needs-review')}
      {onClickAuditTrailLink && (
        <LinkButton onClick={onClickAuditTrailLink} sx={{ marginLeft: 2 }}>
          {t('see-timeline')}
        </LinkButton>
      )}
    </InlineAlert>
  );
};

export default ManualReviewBanner;
