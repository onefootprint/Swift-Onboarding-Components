import { Button, PhoneInput, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';

const IntroStep = () => {
  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Stack direction="column" gap={3}>
        <Text variant="heading-3">Let's verify your customer's identity! ☺</Text>
        <Text variant="body-2" color="secondary">
          Enter their phone number to proceed.
        </Text>
      </Stack>
      <Stack width="100%" flexDirection="column" gap={7}>
        <PhoneInput label="Phone number" />
        <Button size="large">Continue</Button>
      </Stack>
    </Stack>
  );
};

export default IntroStep;
