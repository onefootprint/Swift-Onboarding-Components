import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck16, IcoWarning16 } from '@onefootprint/icons';
import {
  WatchlistCheckEventData,
  WatchlistCheckStatus,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import EventBodyEntry from '../event-body-entry';

type WatchlistCheckEventBodyProps = {
  data: WatchlistCheckEventData;
};

const WatchlistCheckEventBody = ({ data }: WatchlistCheckEventBodyProps) => {
  const { t } = useTranslation(
    'pages.user-details.audit-trail.timeline.watchlist-check-event',
  );
  const { status, reasonCodes } = data;
  const isPass = status === WatchlistCheckStatus.pass;
  const color = isPass ? 'neutral' : 'error';
  const iconComponent = isPass ? IcoCheck16 : IcoWarning16;
  let statusStr = t(`status.${status}`);
  if (!isPass && reasonCodes) {
    // Show some message specific to the reason codes
    statusStr = t(`reason-codes.${reasonCodes[0]}`);
  }

  return (
    <EventBodyEntry
      iconComponent={iconComponent}
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
