import type { Color } from '@onefootprint/design-tokens';
import { IcoCheck16, IcoClose16, IcoDotSmall16, IcoInfo16, IcoWarning16 } from '@onefootprint/icons';
import type { WatchlistCheckEventData } from '@onefootprint/types';
import { WatchlistCheckStatus } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import EventBodyEntry from '../event-body-entry';

type WatchlistCheckEventBodyProps = {
  data: WatchlistCheckEventData;
  lineHeight?: 'default' | 'large';
  showIcons?: boolean;
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

const WatchlistCheckEventBody = ({ data, lineHeight = 'large', showIcons }: WatchlistCheckEventBodyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.watchlist-check-event',
  });
  const { status } = data;
  const color = textColors[status];
  const iconComponent = showIcons ? statusIcons[status] : IcoDotSmall16;
  const statusStr = t(`status.${status}` as ParseKeys<'common'>) as string;

  return (
    <EventBodyEntry
      iconComponent={iconComponent}
      iconColor={color}
      lineHeight={lineHeight}
      content={
        <Container>
          <Text variant="body-3" tag="span" color={color} marginRight={1}>
            {statusStr}
          </Text>
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
