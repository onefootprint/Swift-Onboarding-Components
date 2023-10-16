import { useTranslation } from '@onefootprint/hooks';
import { IcoEye16, IcoWarningSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { EntityStatus } from '@onefootprint/types';
import { Badge, Stack, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

import getBadgeVariantByStatus from '../entities/utils';

export type StatusBadgeProps = {
  status: EntityStatus;
  requiresManualReview?: boolean;
  isOnWatchlist?: boolean;
  shouldShowWatchlistLabel?: boolean;
  watchlistLabel?: string;
};

const StatusBadge = ({
  status,
  requiresManualReview = false,
  shouldShowWatchlistLabel,
  isOnWatchlist,
  watchlistLabel,
}: StatusBadgeProps) => {
  const { t } = useTranslation('entity-statuses');
  const badgeVariant = getBadgeVariantByStatus(status, requiresManualReview);

  return (
    <StatusContainer>
      <Badge variant={badgeVariant} sx={{ whiteSpace: 'nowrap' }}>
        {t(status)}
        {requiresManualReview && (
          <IconContainer>
            <IcoWarningSmall16 color={badgeVariant} testID="manualReviewIcon" />
          </IconContainer>
        )}
      </Badge>
      <Stack gap={2} align="center">
        {isOnWatchlist && (
          <>
            <Tooltip text={watchlistLabel} disabled={shouldShowWatchlistLabel}>
              <Stack
                align="center"
                marginLeft={watchlistLabel ? 5 : 2}
                testID="watchlistFailIcon"
              >
                <IcoEye16 color="error" />
              </Stack>
            </Tooltip>
            {shouldShowWatchlistLabel && (
              <Typography variant="caption-2" color="error">
                {watchlistLabel}
              </Typography>
            )}
          </>
        )}
      </Stack>
    </StatusContainer>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin-left: ${theme.spacing[2]};
  `};
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default StatusBadge;
