import { EntityStatus } from '@onefootprint/types';
import { InlineAlert, LinkButton } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { AUDIT_TRAILS_ID } from '@/entity/constants';

type BannerProps = WithEntityProps;

const Banner = ({ entity }: BannerProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.banner' });

  const handleClick = () => {
    const auditTrail = document.getElementById(AUDIT_TRAILS_ID);
    auditTrail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (entity.requiresManualReview && entity.status !== EntityStatus.none) {
    return (
      <InlineAlert variant={entity.status === EntityStatus.failed ? 'error' : 'warning'}>
        {entity.status === EntityStatus.failed
          ? t('manual-review.failed-needs-review')
          : t('manual-review.verified-needs-review')}
        <LinkButton onClick={handleClick} $marginLeft={2}>
          {t('cta')}
        </LinkButton>
      </InlineAlert>
    );
  }

  if (entity.status === EntityStatus.incomplete) {
    return (
      <InlineAlert variant="warning">
        {t(`incomplete.header.${entity.kind}` as ParseKeys<'common'>)}
        <LinkButton onClick={handleClick} $marginLeft={2}>
          {t('cta')}
        </LinkButton>
      </InlineAlert>
    );
  }

  return null;
};

export default Banner;
