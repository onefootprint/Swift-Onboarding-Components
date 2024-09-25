import { EntityStatus } from '@onefootprint/types';
import { InlineAlert } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { AUDIT_TRAILS_ID } from '@/entity/constants';

type BannerProps = WithEntityProps & {
  isDisabled?: boolean;
};

const Banner = ({ entity, isDisabled }: BannerProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'banner' });

  const handleClick = () => {
    const auditTrail = document.getElementById(AUDIT_TRAILS_ID);
    auditTrail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (entity.requiresManualReview && entity.status !== EntityStatus.none) {
    return (
      <BannerContainer data-is-disabled={isDisabled}>
        <InlineAlert
          variant={entity.status === EntityStatus.failed ? 'error' : 'warning'}
          cta={{
            label: t('cta'),
            onClick: handleClick,
          }}
        >
          {entity.status === EntityStatus.failed
            ? t('manual-review.failed-needs-review')
            : t('manual-review.verified-needs-review')}
        </InlineAlert>
      </BannerContainer>
    );
  }

  if (entity.status === EntityStatus.incomplete) {
    return (
      <BannerContainer data-is-disabled={isDisabled}>
        <InlineAlert
          variant="warning"
          cta={{
            label: t('cta'),
            onClick: handleClick,
          }}
        >
          {t(`incomplete.header.${entity.kind}` as ParseKeys<'common'>)}
        </InlineAlert>
      </BannerContainer>
    );
  }

  return null;
};

const BannerContainer = styled.span`
  &[data-is-disabled='true'] {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }
`;

export default Banner;
