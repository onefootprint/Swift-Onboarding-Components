import styled, { css } from '@onefootprint/styled';
import type { PreviousWatchlistChecksEventData } from '@onefootprint/types';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';

import PreviousWatchlistCheckEvents from './components/previous-watchlist-check-events';

type WatchlistCheckEventHeaderProps = {
  data: PreviousWatchlistChecksEventData;
};

const WatchlistCheckEventHeader = ({
  data,
}: WatchlistCheckEventHeaderProps) => (
  <>
    <Typography
      variant="body-3"
      color="tertiary"
      testID="watchlist-check-event-header"
    >
      <Trans
        i18nKey="pages.entity.audit-trail.timeline.watchlist-check-event.title"
        components={{
          b: <Bold />,
        }}
      />
    </Typography>
    <PreviousWatchlistCheckEvents data={data} />
  </>
);

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

export default WatchlistCheckEventHeader;
