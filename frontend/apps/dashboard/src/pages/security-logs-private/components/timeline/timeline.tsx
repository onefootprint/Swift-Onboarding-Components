import { IcoDotSmall16 } from '@onefootprint/icons';
import type { AccessEvent } from '@onefootprint/types';
import { Box, Grid, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import DateTime from './components/date-time';
import Event from './components/event';
import EventBody from './components/event-body';

const HEADER_HEIGHT = '32px';

export const getKeyForItemTime = (time: string) => {
  if (!time) {
    return 'empty';
  }
  const date = new Date(time);
  return format(date, 'yyyy-MM-dd-HH-mm-ss');
};

const Timeline = ({ accessEvents }: { accessEvents: AccessEvent[] }) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.timeline' });

  if (!accessEvents.length) {
    return <Text variant="body-3">{t('empty')}</Text>;
  }

  return (
    <>
      <Stack direction="column">
        {accessEvents.map((accessEvent, i) => {
          const key = `${getKeyForItemTime(accessEvent.timestamp)}-${i}`;
          const last = i === accessEvents.length - 1;

          return (
            <Grid.Container
              key={key}
              position="relative"
              height="auto"
              columns={['146px 24px 1fr']}
              rows={[`${HEADER_HEIGHT} auto`]}
              alignItems="start"
              justifyContent="start"
              templateAreas={['time icon content', 'empty line content']}
            >
              <Grid.Item grid="time" direction="row" gap={2} height={HEADER_HEIGHT} display="flex" alignItems="center">
                <DateTime timestamp={accessEvent.timestamp} />
              </Grid.Item>
              {!last && <Line data-last={last} gridArea="line" />}
              <Grid.Item
                align="center"
                justify="center"
                backgroundColor="primary"
                minHeight={HEADER_HEIGHT}
                gridArea="icon"
                display="flex"
                alignItems="center"
              >
                {<IcoDotSmall16 />}
              </Grid.Item>
              <Grid.Container
                style={{ gridArea: 'content' }}
                templateAreas={['header', 'body']}
                columns={['1fr']}
                rows={['auto', 'auto']}
                marginLeft={2}
                marginTop={3}
                flexDirection="column"
                gap={3}
              >
                <Grid.Item gridArea="header" align="flex-stat" justify="start" display="flex" alignItems="flex-start">
                  <Event accessEvent={accessEvent} />
                </Grid.Item>
                <Box height="auto" tag="span" marginTop={3}>
                  <EventBody accessEvent={accessEvent} />
                </Box>
              </Grid.Container>
            </Grid.Container>
          );
        })}
      </Stack>
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
    height: 100%;
    background-color: ${theme.borderColor.primary};
  `}
`;

export default Timeline;
