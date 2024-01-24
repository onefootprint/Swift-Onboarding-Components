import type { Color } from '@onefootprint/design-tokens';
import {
  IcoCheck16,
  IcoClose16,
  IcoInfo16,
  IcoWarning16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { WatchlistCheckEventData } from '@onefootprint/types';
import { WatchlistCheckStatus } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import EventBodyEntry from '../event-body-entry';

type WatchlistCheckEventBodyProps = {
  data: WatchlistCheckEventData;
  lineHeight?: 'default' | 'large';
};

type TextColorsType = {
  [key in WatchlistCheckStatus]: Color;
};

const textColors: TextColorsType = {
  [WatchlistCheckStatus.pass]: 'success',
  [WatchlistCheckStatus.fail]: 'error',
  [WatchlistCheckStatus.notNeeded]: 'primary',
  [WatchlistCheckStatus.error]: 'warning',
};

const statusIcons = {
  [WatchlistCheckStatus.pass]: IcoCheck16,
  [WatchlistCheckStatus.fail]: IcoWarning16,
  [WatchlistCheckStatus.notNeeded]: IcoInfo16,
  [WatchlistCheckStatus.error]: IcoClose16,
};

const WatchlistCheckEventBody = ({
  data,
  lineHeight = 'large',
}: WatchlistCheckEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.watchlist-check-event',
  });
  const { status, reasonCodes } = data;
  const isPass = status === WatchlistCheckStatus.pass;
  const color = textColors[status];
  const iconComponent = statusIcons[status];
  let statusStr = t(`status.${status}` as ParseKeys<'common'>) as string;
  if (!isPass && reasonCodes) {
    // Show some message specific to the reason codes
    statusStr = t(
      `reason-codes.${reasonCodes[0]}` as ParseKeys<'common'>,
    ) as string;
  }

  return (
    <EventBodyEntry
      iconComponent={iconComponent}
      iconColor={color}
      lineHeight={lineHeight}
      content={
        <Container>
          <Typography
            variant="body-3"
            as="span"
            color={color}
            sx={{ marginRight: 1 }}
          >
            {statusStr}
          </Typography>
        </Container>
      }
      testID="watchlist-check-event-body"
    />
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

export default WatchlistCheckEventBody;
