import { useTranslation } from '@onefootprint/hooks';
import { IcoEye16, IcoWarningSmall16 } from '@onefootprint/icons';
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
    <Stack align="center">
      <Badge variant={badgeVariant} sx={{ whiteSpace: 'nowrap' }}>
        <span>{t(status)}</span>
        {requiresManualReview && (
          <Stack marginLeft={2}>
            <IcoWarningSmall16 color={badgeVariant} testID="manualReviewIcon" />
          </Stack>
        )}
      </Badge>
      <Stack gap={2} align="center">
        {isOnWatchlist && (
          <>
            <Tooltip text={watchlistLabel} disabled={shouldShowWatchlistLabel}>
              <Stack
                align="center"
                marginLeft={watchlistLabel ? 5 : 2}
                data-testid="watchlistFailIcon"
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
    </Stack>
  );
};

export default StatusBadge;
