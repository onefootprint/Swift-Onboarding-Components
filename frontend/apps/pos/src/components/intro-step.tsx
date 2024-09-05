import { Button, PhoneInput, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const IntroStep = () => {
  return (
    <Stack direction="column" gap={7} textAlign="center" width="100%" alignItems="center">
      <Image src="/logo.png" width={92} height={30} alt="Avi's logo" />
      <Stack direction="column" gap={3}>
        <Text variant="heading-3">Let's verify your customer's identity! 😊</Text>
        <Text variant="body-2" color="secondary">
          Enter their phone number to proceed.
        </Text>
      </Stack>
      <Stack flexDirection="column">
        <Stack flexDirection="column" gap={7}>
          <PhoneInput label="Phone number" />
          <Button size="large">Continue</Button>
        </Stack>
        <Stack alignItems="center" marginBlock={5}>
          <Divider />
          <Text variant="body-4" color="tertiary" width="50px">
            or
          </Text>
          <Divider />
        </Stack>
        <Stack flexDirection="column">
          <Button size="large" variant="secondary">
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
