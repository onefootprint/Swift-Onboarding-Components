import { Text } from '@onefootprint/ui';

type ErrorProps = {
  message: string;
};

const ErrorComponent = ({ message }: ErrorProps) => (
  <Text color="secondary" variant="body-2">
    {message}
  </Text>
);

export default ErrorComponent;
