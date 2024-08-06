import { getErrorMessage } from '@onefootprint/request';
import { Box, Text } from '@onefootprint/ui';

type ErrorProps = {
  error: unknown;
  testID?: string;
};

const ErrorComponent = ({ error, testID }: ErrorProps) => (
  <Box testID={testID}>
    <Text variant="body-3">{getErrorMessage(error)}</Text>
  </Box>
);

export default ErrorComponent;
