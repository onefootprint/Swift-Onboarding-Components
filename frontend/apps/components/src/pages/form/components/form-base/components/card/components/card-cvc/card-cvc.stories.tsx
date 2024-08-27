import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import type { CardCvcProps } from './card-cvc';
import CardCvc from './card-cvc';

export default {
  component: CardCvc,
  title: 'Components/CardCvc',
  argTypes: {
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the CVC input and hint',
      required: false,
    },
    hint: {
      control: 'text',
      description: 'Display an informative as then there is an error',
      required: false,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    numDigits: {
      control: 'select',
      description: 'The number of digits in the card CVC or length',
      options: [3, 4],
    },
  },
} as Meta;

const Template: StoryFn<CardCvcProps> = ({
  hasError,
  hint,
  testID,
  onChange,
  numDigits,
  value: initialValue = '',
}: CardCvcProps) => {
  const [value, setValue] = useState<string>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
  };
  return (
    <CardCvc
      hasError={hasError}
      hint={hint}
      onChange={onChange}
      onChangeText={handleChangeText}
      testID={testID}
      numDigits={numDigits}
      value={value}
      sx={{ width: '100px' }}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  hasError: false,
  hint: '',
  onChange: console.log, // eslint-disable-line no-console
  testID: 'card-cvc-test-id',
  numDigits: 3,
};
