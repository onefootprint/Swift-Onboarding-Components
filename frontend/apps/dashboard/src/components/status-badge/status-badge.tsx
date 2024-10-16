import { IcoEye16, IcoWarningSmall16 } from '@onefootprint/icons';
import type { EntityStatus } from '@onefootprint/types';
import { Badge, Stack, Text, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import getBadgeVariantByStatus from 'src/utils/get-badge-variant-by-status';

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
  const { t } = useTranslation('common', { keyPrefix: 'entity-statuses' });
  const badgeVariant = getBadgeVariantByStatus(status, requiresManualReview);

  return (
    <Stack align="center">
      <Badge variant={badgeVariant} whiteSpace="nowrap">
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
              <Stack align="center" marginLeft={watchlistLabel ? 5 : 2} data-testid="watchlistFailIcon">
                <IcoEye16 color="error" />
              </Stack>
            </Tooltip>
            {shouldShowWatchlistLabel && (
              <Text variant="caption-2" color="error">
                {watchlistLabel}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default StatusBadge;
