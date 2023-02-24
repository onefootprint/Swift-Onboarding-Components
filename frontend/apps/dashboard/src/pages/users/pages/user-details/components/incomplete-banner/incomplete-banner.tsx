import { useTranslation } from '@onefootprint/hooks';
import { InlineAlert, LinkButton } from '@onefootprint/ui';
import React from 'react';

type ManualReviewBannerProps = {
  onClickAuditTrailLink?: () => void;
};

const IncopmleteBanner = ({
  onClickAuditTrailLink,
}: ManualReviewBannerProps) => {
  const { t } = useTranslation('components.incomplete-banner');

  return (
    <InlineAlert variant="warning">
      {t('header')}
      {onClickAuditTrailLink && (
        <LinkButton onClick={onClickAuditTrailLink} sx={{ marginLeft: 2 }}>
          {t('see-timeline')}
        </LinkButton>
      )}
    </InlineAlert>
  );
};

export default IncopmleteBanner;
