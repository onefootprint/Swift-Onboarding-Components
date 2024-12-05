import Header from '@/components/header';
import { useFootprint } from '@onefootprint/footprint-react';
import { Button, PhoneInput, Stack, Text } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

type IntroStepProps = {
  onHandoff: (phoneNumber: string) => void;
  onFillout: (phoneNumber: string) => void;
};

type FormValues = {
  phoneNumber: string;
};

const IntroStep = ({ onHandoff, onFillout }: IntroStepProps) => {
  const { control, handleSubmit } = useForm<FormValues>();
  const fp = useFootprint();
  const mutation = useMutation({
    mutationFn: fp.createEmailPhoneBasedChallenge,
  });

  const handleFormSubmit = handleSubmit(() => {
    // TODO:
    console.log(onHandoff);
  });

  const handleFillout = handleSubmit(data => {
    mutation.mutate(
      { phoneNumber: data.phoneNumber },
      {
        onSuccess: () => onFillout(data.phoneNumber),
      },
    );
  });

  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Header title="Let's verify your customer's identity! 😊" subtitle="Enter their phone number to proceed." />
      <Stack flexDirection="column" tag="form" onSubmit={handleFormSubmit}>
        <Stack flexDirection="column" gap={7}>
          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: 'Phone number is required',
            }}
            render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
              <PhoneInput
                label="Phone number"
                hasError={!!error}
                hint={error?.message}
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Button size="large" type="submit">
            Continue
          </Button>
        </Stack>
        <Stack alignItems="center" marginBlock={5}>
          <Divider />
          <Text variant="body-3" color="tertiary" width="50px">
            or
          </Text>
          <Divider />
        </Stack>
        <Stack flexDirection="column">
          <Button size="large" variant="secondary" onClick={handleFillout} loading={mutation.isLoading}>
            Fill out for customer
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

const Divider = styled.div`
  ${({ theme }) => css`
    width: 199px;
    height: 1px;
    background-color: ${theme.borderColor.tertiary};
  `}
`;

export default IntroStep;
