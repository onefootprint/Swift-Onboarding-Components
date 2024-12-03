import { IcoDotSmall16 } from '@onefootprint/icons';
import type { AuditEvent } from '@onefootprint/request-types/dashboard';
import { Box, Grid, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useSecurityLogsFilters from 'src/hooks/use-security-logs-filters';
import styled, { css } from 'styled-components';
import DateTime from './components/date-time';
import Event from './components/event';
import EventBody from './components/event-body';
import Loading from './loading';

const HEADER_HEIGHT = '32px';

export const getKeyForItemTime = (time: string) => {
  if (!time) {
    return 'empty';
  }
  const date = new Date(time);
  return format(date, 'yyyy-MM-dd-HH-mm-ss');
};

type TimelineProps = {
  auditEvents: AuditEvent[];
  isLoading: boolean;
  isError: boolean;
  showDecryptionReason: boolean;
};

const Timeline = ({ auditEvents, isLoading, showDecryptionReason, isError }: TimelineProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.timeline' });
  const filters = useSecurityLogsFilters();

  if (!filters.isReady || isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Text variant="body-3">{t('error')}</Text>;
  }

  if (!auditEvents.length) {
    return <Text variant="body-3">{t('empty')}</Text>;
  }

  return (
    <>
      <Stack direction="column">
        {auditEvents.map((accessEvent, i) => {
          const key = `${getKeyForItemTime(accessEvent.timestamp)}-${i}`;
          const last = i === auditEvents.length - 1;

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
                marginTop={2}
                paddingTop={1}
                flexDirection="column"
                gap={3}
              >
                <Grid.Item gridArea="header" align="flex-stat" justify="start" display="flex" alignItems="flex-start">
                  <Event auditEvent={accessEvent} />
                </Grid.Item>
                <Box height="auto" tag="span" marginTop={3}>
                  <EventBody auditEvent={accessEvent} showDecryptionReason={showDecryptionReason} />
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
