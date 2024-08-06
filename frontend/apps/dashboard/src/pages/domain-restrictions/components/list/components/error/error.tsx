import { getErrorMessage } from '@onefootprint/request';
import { Text } from '@onefootprint/ui';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => (
  <Text variant="body-2" color="secondary">
    {getErrorMessage(error)}
  </Text>
);

export default ErrorComponent;
