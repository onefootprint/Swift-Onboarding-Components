import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import PinInput, { PinInputProps } from './pin-input';

export default {
  title: 'Components/PinInput',
  component: PinInput,
  argTypes: {
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
    onComplete: {
      description: 'Function called on input change',
      required: false,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof PinInput>;

const Template: Story<PinInputProps> = ({
  hasError,
  hintText,
  onComplete,
  testID,
}: PinInputProps) => (
  <PinInput
    hasError={hasError}
    hintText={hintText}
    onComplete={onComplete}
    testID={testID}
  />
);

export const Base = Template.bind({});
Base.args = {
  hasError: false,
  hintText: '',
  onComplete: console.log,
  testID: 'pin-input-test-id',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hintText: 'Incorrect verification code',
  onComplete: console.log,
  testID: 'pin-input-test-id',
};
