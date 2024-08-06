import { Box, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { EventLog } from 'src/pages/kyc/onboarding-components/kyc.types';
import styled, { css } from 'styled-components';

const Event = ({ event }: { event: EventLog }) => {
  return (
    <EventContainer padding={3} gap={2} direction="row" justify="space-between">
      <Text variant="snippet-2" color="tertiary">
        {event.createdAt && format(new Date(event.createdAt), 'HH:mm:ss')}
      </Text>
      <Stack direction="column" gap={2} align="flex-end" flexWrap="wrap">
        <Text variant="snippet-2" color="secondary">
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} ⋅ {event.name}
        </Text>
        {event.type === 'change' && event.value !== '' && (
          <Stack direction="row" gap={2} align="center" flexWrap="wrap">
            <Text variant="snippet-2" color="quaternary">
              {event.value}
              {event.isAutoCompleted && (
                <>
                  ⋅{' '}
                  <Box tag="span" color="error">
                    Auto completed
                  </Box>
                </>
              )}
            </Text>
          </Stack>
        )}
      </Stack>
    </EventContainer>
  );
};

const EventContainer = styled(motion(Stack))`
  ${({ theme }) => css`
    &:last-of-type {
      margin-bottom: ${theme.spacing[9]};
    }
  `}
`;

export default Event;
