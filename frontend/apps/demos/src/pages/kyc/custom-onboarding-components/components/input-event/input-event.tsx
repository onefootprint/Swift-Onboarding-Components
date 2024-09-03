import { IcoPencil16 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';
import type { InputEventProps } from '../../kyc.types';

const InputEvent = ({ event }: { event: InputEventProps }) => {
  return (
    <Stack padding={4} gap={2} direction="row" width="100%">
      <Text variant="snippet-2" color="tertiary" whiteSpace="nowrap">
        {event.createdAt && format(new Date(event.createdAt), 'HH:mm:ss')}
      </Text>
      <Stack
        direction="row"
        gap={2}
        align="center"
        flexWrap="wrap"
        alignContent="center"
        flexGrow={1}
        justify="flex-end"
      >
        <IcoPencil16 color="tertiary" />
        <Text variant="snippet-2" color="secondary" whiteSpace="nowrap">
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} ⋅ {event.name}
        </Text>
        {event.type === 'change' && event.value !== '' && (
          <Stack direction="row" gap={2} align="center">
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
    </Stack>
  );
};

export default InputEvent;
