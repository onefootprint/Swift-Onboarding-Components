import { LinkButton, PinInput, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';

const OtepStep = () => {
  const handleSubmit = () => {
    console.log('submit');
  };

  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Stack direction="column" gap={3}>
        <Text variant="heading-3">Verify their phone number</Text>
        <Text variant="body-2" color="secondary">
          Enter the 6-digit code sent to (•••) ••• ••02.
        </Text>
      </Stack>
      <Stack flexDirection="column" gap={8} alignItems="center">
        <PinInput onComplete={handleSubmit} />
        <LinkButton>Resend code</LinkButton>
      </Stack>
    </Stack>
  );
};

export default OtepStep;
