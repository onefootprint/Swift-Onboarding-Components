import { type FormValues, Fp, useOtp } from '@onefootprint/footprint-react';
import { Box, Button, Divider, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import EncryptedInput from '../../components/encrypted-input';
import type { FormStates, StepProps } from '../../kyc.types';

const Identify = ({ onFormSubmit, onInputEvent }: StepProps) => {
  const [formState, setFormState] = useState<FormStates>('default');
  const otp = useOtp();

  const handleSubmit = (formValues: FormValues) => {
    setFormState('loading');
    otp.launchIdentify(
      {
        email: formValues['id.email'],
        phoneNumber: formValues['id.phone_number'],
      },
      {
        onAuthenticated: onFormSubmit,
      },
    );
  };

  return (
    <>
      <Box marginBottom={7}>
        <Text variant="heading-3">Identification</Text>
        <Text variant="body-3" color="secondary">
          Please provide your email and phone number
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column" width="100%">
          {formState !== 'default' ? (
            <EncryptedInput label="Your email" valueToEncrypt="jane@acme.com" />
          ) : (
            <Fp.Field name="id.email">
              <Fp.Label>Your email</Fp.Label>
              <Fp.Input
                placeholder="jane@acme.com"
                autoComplete="email"
                onChange={onInputEvent}
                onBlur={onInputEvent}
                onMouseEnter={onInputEvent}
                onMouseLeave={onInputEvent}
              />
              <Fp.FieldErrors />
            </Fp.Field>
          )}
          {formState !== 'default' ? (
            <EncryptedInput label="Your phone number" valueToEncrypt="(123) 456-7890" />
          ) : (
            <Fp.Field name="id.phone_number">
              <Fp.Label>Phone</Fp.Label>
              <Fp.Input
                placeholder="(123) 456-7890"
                autoComplete="tel"
                onChange={onInputEvent}
                onBlur={onInputEvent}
                onMouseEnter={onInputEvent}
                onMouseLeave={onInputEvent}
              />
              <Fp.FieldErrors />
            </Fp.Field>
          )}
          <Divider marginBlock={3} />
          <Button type="submit" disabled={formState === 'loading'} loading={formState === 'loading'}>
            Continue
          </Button>
        </Stack>
      </Fp.Form>
    </>
  );
};

export default Identify;
