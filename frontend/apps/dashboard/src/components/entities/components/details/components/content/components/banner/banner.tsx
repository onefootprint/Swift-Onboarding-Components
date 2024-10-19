import { EntityKind, EntityStatus } from '@onefootprint/types';
import { InlineAlert } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { AUDIT_TRAILS_ID } from '@/entity/constants';

type BannerProps = WithEntityProps & {
  isDisabled?: boolean;
};

const Banner = ({ entity, isDisabled }: BannerProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'banner' });
  const isBusiness = entity.kind === EntityKind.business;

  const getReviewText = (isBusiness: boolean, status: EntityStatus) => {
    if (status === EntityStatus.failed) {
      return isBusiness ? t('manual-review.business.failed') : t('manual-review.person.failed');
    }
    return isBusiness ? t('manual-review.business.verified') : t('manual-review.person.verified');
  };

  const getIncompleteText = (isBusiness: boolean) => {
    return isBusiness ? t('incomplete.header.business') : t('incomplete.header.person');
  };

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
          {getReviewText(isBusiness, entity.status)}
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
          {getIncompleteText(isBusiness)}
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
