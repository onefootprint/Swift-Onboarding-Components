import { IcoDotSmall16 } from '@onefootprint/icons';
import { Box, Grid, LoadingSpinner, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import TimelineItemTime from '../timeline-item-time';

export type TimelineItem = {
  timestamp?: string;
  iconComponent?: React.ReactNode; // If icon is not provided, we show a dashed line between prev and next items
  headerComponent: React.ReactNode;
  bodyComponent?: React.ReactNode;
};

type TimelineProps = {
  items: TimelineItem[];
  isPending?: boolean;
};

const HEADER_HEIGHT = '32px';

const Timeline = ({ items, isPending }: TimelineProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.timeline' });
  if (!isPending && !items.length) {
    return <Text variant="body-3">{t('empty')}</Text>;
  }

  return (
    <>
      <Stack direction="column">
        {items.map((item: TimelineItem, i: number) => {
          const key = `${item.timestamp || 'empty'}-${i}`;
          const { iconComponent, headerComponent, bodyComponent } = item;
          const last = i === items.length - 1;

          return (
            <Grid.Container
              key={key}
              position="relative"
              height="auto"
              columns={['146px 24px 1fr']}
              rows={[`${HEADER_HEIGHT} auto`]}
              alignItems="start"
              justifyContent="start"
              templateAreas={['time icon content', 'empty line content', 'empty line content']}
            >
              <Grid.Item grid="time" direction="row" gap={2} height={HEADER_HEIGHT}>
                {item.timestamp && <TimelineItemTime timestamp={item.timestamp} />}
              </Grid.Item>
              {!last && <Line data-last={last} gridArea="line" />}
              <Grid.Item
                align="center"
                justify="center"
                paddingTop={2}
                paddingBottom={2}
                backgroundColor="primary"
                minHeight={HEADER_HEIGHT}
                gridArea="icon"
              >
                {iconComponent ?? <IcoDotSmall16 />}
              </Grid.Item>
              <Grid.Container
                style={{ gridArea: 'content' }}
                templateAreas={['header', 'body']}
                columns={['1fr']}
                rows={['auto']}
                marginLeft={2}
                gap={5}
              >
                <Grid.Item
                  gridArea="header"
                  align="center"
                  justify="start"
                  marginTop={0}
                  gap={2}
                  minHeight={HEADER_HEIGHT}
                >
                  {headerComponent}
                </Grid.Item>
                {bodyComponent ? (
                  <Grid.Item gridArea="body" direction="column" gap={2} width="100%" paddingBottom={7} paddingLeft={3}>
                    {bodyComponent}
                  </Grid.Item>
                ) : (
                  <Box height="4px" tag="span" />
                )}
              </Grid.Container>
            </Grid.Container>
          );
        })}
      </Stack>
      {isPending && (
        <Stack padding={7} width="100%" align="center" justify="center">
          <LoadingSpinner />
        </Stack>
      )}
    </>
  );
};

const Line = styled(Grid.Item)`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    background-color: ${theme.borderColor.primary};
  `}
`;

export default Timeline;
