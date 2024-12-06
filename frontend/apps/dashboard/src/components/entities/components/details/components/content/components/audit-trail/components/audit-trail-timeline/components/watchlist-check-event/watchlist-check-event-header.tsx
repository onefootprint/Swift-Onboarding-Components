import { Text, createFontStyles } from '@onefootprint/ui';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import PreviousWatchlistCheckEvents from './components/previous-watchlist-check-events';

const WatchlistCheckEventHeader = () => (
  <>
    <Text variant="body-3" color="tertiary" testID="watchlist-check-event-header">
      <Trans
        ns="entity-details"
        i18nKey="audit-trail.timeline.watchlist-check-event.title"
        components={{
          b: <Bold />,
        }}
      />
    </Text>
    <PreviousWatchlistCheckEvents />
  </>
);

const Bold = styled.b`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.primary};
  `}
`;

export default WatchlistCheckEventHeader;
