import Header from '@/components/header';
import { LinkButton, PinInput, Stack } from '@onefootprint/ui';
import Image from 'next/image';

const OtepStep = () => {
  const handleSubmit = () => {
    console.log('submit');
  };

  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Header title="Verify their phone number" subtitle="Enter the 6-digit code sent to (•••) ••• ••02." />
      <Stack flexDirection="column" gap={8} alignItems="center">
        <PinInput onComplete={handleSubmit} />
        <LinkButton>Resend code</LinkButton>
      </Stack>
    </Stack>
  );
};

export default OtepStep;
