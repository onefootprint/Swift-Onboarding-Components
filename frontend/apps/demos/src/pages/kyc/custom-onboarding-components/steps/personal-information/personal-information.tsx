import { type FormValues, Fp, useFootprint } from '@onefootprint/footprint-react';
import { Box, Button, Divider, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import EncryptedInput from '../../components/encrypted-input';
import type { FormStates, StepProps } from '../../kyc.types';

const PersonalInformation = ({ onFormSubmit, onInputEvent }: StepProps) => {
  const [formState, setFormState] = useState<FormStates>('default');
  const fp = useFootprint();

  const handleSubmit = async (formValues: FormValues) => {
    setFormState('loading');
    try {
      await fp.vault(formValues);
      fp.handoff({ onComplete: onFormSubmit });
    } catch (e) {
      console.log(e);
    }
  };

  const renderField = (
    name: keyof FormValues,
    label: string,
    placeholder: string,
    valueToEncrypt: string,
    autoComplete?: string,
  ) =>
    formState !== 'default' ? (
      <EncryptedInput label={label} valueToEncrypt={valueToEncrypt} />
    ) : (
      <Fp.Field name={name}>
        <Fp.Label>{label}</Fp.Label>
        <Fp.Input
          placeholder={placeholder}
          onChange={onInputEvent}
          onBlur={onInputEvent}
          onMouseEnter={onInputEvent}
          onMouseLeave={onInputEvent}
          autoComplete={autoComplete}
        />
        <Fp.FieldErrors />
      </Fp.Field>
    );

  return (
    <>
      <Box marginBottom={7}>
        <Text variant="heading-3">Basic information</Text>
        <Text variant="body-3" color="secondary">
          Please provide some basic personal information
        </Text>
      </Box>
      <Fp.Form onSubmit={handleSubmit}>
        <Stack gap={4} direction="column" width="100%">
          {renderField('id.first_name', 'First name', 'Jane', 'Jane', 'given-name')}
          {renderField('id.middle_name', 'Middle name', 'Sue', 'Sue', 'additional-name')}
          {renderField('id.last_name', 'Last name', 'Joe', 'Joe', 'family-name')}
          {renderField('id.dob', 'DOB', 'MM/DD/YYYY', 'MM/DD/YYYY', 'bday')}
          <Divider marginBlock={3} />
          <Fp.Field name="id.country">
            <Fp.Input
              placeholder="US"
              defaultValue="US"
              type="hidden"
              onChange={onInputEvent}
              onBlur={onInputEvent}
              onMouseEnter={onInputEvent}
              onMouseLeave={onInputEvent}
            />
          </Fp.Field>
          {renderField('id.address_line1', 'Address line 1', 'Street number', 'Street number')}
          {renderField(
            'id.address_line2',
            'Address line 2 (optional)',
            'Apartment, suite, etc.',
            'Apartment, suite, etc.',
          )}
          {renderField('id.city', 'City', 'New York', 'New York')}
          {renderField('id.state', 'State', 'NY', 'NY')}
          {renderField('id.zip', 'Zip', '11206', '11206')}
          <Divider marginBlock={3} />
          {renderField('id.ssn9', 'SSN', 'XXX-XX-XXXX', 'XXX-XX-XXXX')}
          <Divider marginBlock={3} />
          <Button type="submit" disabled={formState === 'loading'} loading={formState === 'loading'}>
            Continue
          </Button>
        </Stack>
      </Fp.Form>
    </>
  );
};

export default PersonalInformation;
