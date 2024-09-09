import Header from '@/components/header';
import { useFootprint } from '@onefootprint/footprint-react';
import { LinkButton, LoadingSpinner, PinInput, Stack, SuccessCheck, Text } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';

type OtpStepProps = {
  onSuccess: () => void;
};

const OtpStep = ({ onSuccess }: OtpStepProps) => {
  const fp = useFootprint();
  const [isWaiting, setIsWaiting] = useState(false);
  const verify = useMutation({
    mutationFn: fp.verify,
    onSuccess: () => {
      setIsWaiting(true);
      setTimeout(() => {
        setIsWaiting(false);
        onSuccess();
      }, 2500);
    },
  });

  const handleSubmit = (verificationCode: string) => {
    verify.mutate({ verificationCode });
  };

  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Header title="Verify their phone number" subtitle="Enter the 6-digit code sent to (•••) ••• ••02." />
      {verify.isSuccess || isWaiting ? (
        <Stack height="95px" center gap={5} flexDirection="column">
          <SuccessCheck animationStart />
          <Text variant="label-3" color="success">
            Success!
          </Text>
        </Stack>
      ) : (
        <>
          {verify.isLoading ? (
            <Stack height="95px" center gap={5} flexDirection="column">
              <LoadingSpinner color="primary" />
              <Text variant="label-3">Verifying...</Text>
            </Stack>
          ) : (
            <Stack flexDirection="column" gap={8} alignItems="center">
              <PinInput autoFocus onComplete={handleSubmit} />
              <LinkButton>Resend code</LinkButton>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
};

export default OtpStep;
