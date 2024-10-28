import { Stack, Text } from '@onefootprint/ui';
import { format } from 'date-fns';

type DateTimeProps = {
  timestamp: string;
};

const DateTime = ({ timestamp }: DateTimeProps) => {
  return (
    <Stack gap={3}>
      <Text color="tertiary" variant="snippet-2" width="72px">
        {format(new Date(timestamp), 'MM/dd/yy')}
      </Text>
      <Text color="tertiary" variant="snippet-2" width="68px">
        {format(new Date(timestamp), 'h:mm a')}
      </Text>
    </Stack>
  );
};

export default DateTime;
