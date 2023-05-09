import { useTranslation } from '@onefootprint/hooks';
import { IcoEye16, IcoWarning16 } from '@onefootprint/icons';
import { EntityStatus } from '@onefootprint/types';
import { Badge, Box, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import getBadgeVariantByStatus from '../entities/utils';

export type StatusBadgeProps = {
  status: EntityStatus;
  requiresManualReview?: boolean;
  isOnWatchlist?: boolean;
  watchlistLabel?: string;
};

const StatusBadge = ({
  status,
  requiresManualReview = false,
  isOnWatchlist,
  watchlistLabel,
}: StatusBadgeProps) => {
  const { t } = useTranslation('entity-statuses');
  const badgeVariant = getBadgeVariantByStatus(status, requiresManualReview);

  return (
    <StatusContainer>
      <Badge variant={badgeVariant}>
        {t(status)}
        {requiresManualReview && (
          <IconContainer>
            <IcoWarning16 color={badgeVariant} />
          </IconContainer>
        )}
      </Badge>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {isOnWatchlist && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: watchlistLabel ? 5 : 2,
              }}
              testID="watchlistFailIcon"
            >
              <IcoEye16 color="error" />
            </Box>
            {watchlistLabel && (
              <Typography variant="caption-2" color="error">
                {watchlistLabel}
              </Typography>
            )}
          </>
        )}
      </Box>
    </StatusContainer>
  );
};

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[2]};
  `};
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

export default StatusBadge;
