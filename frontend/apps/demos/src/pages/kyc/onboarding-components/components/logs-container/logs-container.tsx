import { Box, ScrollArea, Stack, Text } from '@onefootprint/ui';
import uniqueId from 'lodash/uniqueId';
import React, { useEffect, useRef } from 'react';
import { EventLog } from '../../kyc.types';
import Event from './components/event';

type LogsContainerProps = {
  eventLog: EventLog[];
};

const LogsContainer = ({ eventLog }: LogsContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  return (
    <Box borderColor="tertiary" borderWidth={1} borderStyle="solid" height="100vh" width="420px" overflow="hidden">
      <Stack
        justify="flex-start"
        align="center"
        height="47px"
        borderBottomWidth={1}
        borderColor="tertiary"
        borderStyle="solid"
        paddingLeft={4}
      >
        <Text variant="label-3">Event Log</Text>
      </Stack>
      <Box ref={scrollRef} maxHeight="100%" overflow="auto" padding={4}>
        {eventLog.map(event => (
          <Event key={uniqueId()} event={event} />
        ))}
      </Box>
    </Box>
  );
};

export default LogsContainer;
