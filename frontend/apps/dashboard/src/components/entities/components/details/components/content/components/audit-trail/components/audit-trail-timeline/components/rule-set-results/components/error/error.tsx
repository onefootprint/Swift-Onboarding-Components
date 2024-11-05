import { Box, Text } from '@onefootprint/ui';

type ErrorProps = {
  errorMessage: string;
};

const ErrorComponent = ({ errorMessage }: ErrorProps) => (
  <Box>
    <Text variant="body-3">{errorMessage}</Text>
  </Box>
);

export default ErrorComponent;
