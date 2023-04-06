import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { EntityStatus } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import getBadgeVariantByStatus from '../../utils';

export type StatusBadgeProps = {
  status: EntityStatus;
  requiresManualReview?: boolean;
};

const StatusBadge = ({
  status,
  requiresManualReview = false,
}: StatusBadgeProps) => {
  const { t } = useTranslation('entity-statuses');
  const badgeVariant = getBadgeVariantByStatus(status, requiresManualReview);

  return (
    <Badge variant={badgeVariant}>
      {t(status)}
      {requiresManualReview && (
        <IconContainer>
          <IcoWarning16 color={badgeVariant} />
        </IconContainer>
      )}
    </Badge>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `};
`;

export default StatusBadge;
