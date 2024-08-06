import { getErrorMessage } from '@onefootprint/request';
import { Box, Text } from '@onefootprint/ui';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => (
  <Box testID="onboarding-invite-error">
    <Text variant="body-3">{getErrorMessage(error)}</Text>
  </Box>
);

export default ErrorComponent;
