import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import Button from '../button';
import Typography from '../typography';
import AddressInput, { AddressInputProps } from './address-input';

export default {
  component: AddressInput,
  title: 'Components/AddressInput',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Specifies that the input element should be disabled',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the input and hint',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    hintText: {
      control: 'text',
      description: 'Display an informative text below the input',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Displays a label text, above the input',
      required: false,
    },
    onChangeText: {
      description: 'Event when the text changes, sending only the text',
      required: false,
    },
    placeholder: {
      control: 'text',
      description: 'An informative text that goes inside the input',
      required: false,
      name: 'Placeholder *',
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<AddressInputProps> = ({
  disabled,
  hasError,
  hintText,
  label,
  onChangeText,
  onSelect,
  placeholder,
  testID,
  value: initialValue = '',
}: AddressInputProps) => {
  const [value, setValue] = useState<string>(initialValue);

  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '500px',
        padding: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ marginBottom: 3 }}>
          <Typography variant="heading-2" color="primary">
            What is your residential address?
          </Typography>
        </Box>
        <Box sx={{ marginBottom: 8 }}>
          <Typography variant="body-2" color="secondary">
            We are legally required to collect this information.{' '}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <AddressInput
          country="US"
          disabled={disabled}
          hasError={hasError}
          hintText={hintText}
          label={label}
          onChangeText={handleChangeText}
          onSelect={onSelect}
          placeholder={placeholder}
          testID={testID}
          value={value}
        />
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <Button fullWidth>Continue</Button>
      </Box>
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hintText: '',
  label: 'Address line 1',
  onSelect: console.log,
  placeholder: 'Street and house number',
  testID: 'input-test-id',
  value: '',
  hasError: false,
};

export const WithHint = Template.bind({});
WithHint.args = {
  hintText: 'Hint',
  label: 'Address line 1',
  onSelect: console.log,
  placeholder: 'Street and house number',
  value: '',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hintText: 'Hint',
  label: 'Address line 1',
  onSelect: console.log,
  placeholder: 'Street and house number',
  value: '',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Address line 1',
  onSelect: console.log,
  placeholder: 'Street and house number',
  value: '',
};
