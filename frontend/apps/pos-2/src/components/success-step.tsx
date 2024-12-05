import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';

const SuccessStep = () => {
  return (
    <Stack direction="column" gap={5} textAlign="center" width="100%" alignItems="center">
      <IcoCheckCircle40 color="success" />
      <Stack direction="column" gap={3}>
        <Text variant="heading-3" color="success">
          Pass
        </Text>
        <Text variant="body-2" color="secondary">
          Their identity was successfully verified!
        </Text>
      </Stack>
    </Stack>
  );
};

export default SuccessStep;
