import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { InlineAlert, LinkButton } from '@onefootprint/ui';
import React from 'react';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { AUDIT_TRAILS_ID } from '@/entity/constants';

type BannerProps = WithEntityProps;

const Banner = ({ entity }: BannerProps) => {
  const { t } = useTranslation('pages.entity.banner');

  const handleClick = () => {
    const auditTrail = document.getElementById(AUDIT_TRAILS_ID);
    auditTrail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (entity.requiresManualReview && entity.status !== EntityStatus.none) {
    return (
      <InlineAlert
        variant={entity.status === EntityStatus.failed ? 'error' : 'warning'}
      >
        {entity.status === EntityStatus.failed
          ? t('manual-review.failed-needs-review')
          : t('manual-review.verified-needs-review')}
        <LinkButton onClick={handleClick} sx={{ marginLeft: 2 }}>
          {t('cta')}
        </LinkButton>
      </InlineAlert>
    );
  }

  if (entity.status === EntityStatus.incomplete) {
    return (
      <InlineAlert variant="warning">
        {t(`incomplete.header.${entity.kind}`)}
        <LinkButton onClick={handleClick} sx={{ marginLeft: 2 }}>
          {t('cta')}
        </LinkButton>
      </InlineAlert>
    );
  }

  return null;
};

export default Banner;
