import type { PreviousWatchlistChecksEventData } from '@onefootprint/types';
import { Text, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import PreviousWatchlistCheckEvents from './components/previous-watchlist-check-events';

type WatchlistCheckEventHeaderProps = {
  data: PreviousWatchlistChecksEventData;
};

const WatchlistCheckEventHeader = ({ data }: WatchlistCheckEventHeaderProps) => (
  <>
    <Text variant="body-3" color="tertiary" testID="watchlist-check-event-header">
      <Trans
        i18nKey="pages.entity.audit-trail.timeline.watchlist-check-event.title"
        components={{
          b: <Bold />,
        }}
      />
    </Text>
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
