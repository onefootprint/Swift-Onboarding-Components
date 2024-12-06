import { IcoDotSmall16 } from '@onefootprint/icons';
import { Box, Grid, LinkButton, LoadingSpinner, Stack, Text } from '@onefootprint/ui';
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
  pagination?: {
    hasNextPage: boolean;
    fetchNextPage: () => void;
  };
};

const HEADER_HEIGHT = '32px';

const Timeline = ({ items, isPending, pagination }: TimelineProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.timeline' });
  if (!isPending && !items.length) {
    return <Text variant="body-3">{t('empty')}</Text>;
  }

  const allItems = [...items];
  if (pagination?.hasNextPage) {
    allItems.push({
      headerComponent: (
        <LinkButton disabled={isPending} onClick={() => pagination.fetchNextPage()}>
          {t('show-more')}
        </LinkButton>
      ),
      iconComponent: null,
    });
  }

  return (
    <>
      <Stack direction="column">
        {allItems.map((item: TimelineItem, i: number) => {
          const key = `${item.timestamp || 'empty'}-${i}`;
          const { iconComponent, headerComponent, bodyComponent } = item;
          const last = i === allItems.length - 1;
          // True if next item is a pagination button
          const nextIsPagination = allItems[i + 1]?.iconComponent === null;

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
              {!last && <Line gridArea="line" forPagination={nextIsPagination} />}
              <Grid.Item
                align="center"
                justify="center"
                paddingTop={2}
                paddingBottom={2}
                backgroundColor={iconComponent !== null ? 'primary' : 'transparent'}
                minHeight={HEADER_HEIGHT}
                gridArea="icon"
              >
                {iconComponent === undefined ? <IcoDotSmall16 /> : iconComponent}
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

const Line = styled(Grid.Item)<{ forPagination?: boolean }>`
  ${({ theme, forPagination }) => css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: ${forPagination ? `calc(100% + ${HEADER_HEIGHT} / 2)` : '100%'};
    background: ${
      forPagination
        ? `linear-gradient(to bottom, ${theme.borderColor.primary}, ${theme.backgroundColor.primary})`
        : theme.borderColor.primary
    };
  `}
`;

export default Timeline;
