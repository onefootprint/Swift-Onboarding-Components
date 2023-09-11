import { IcoBook16, IcoHelp16 } from '@onefootprint/icons';
import type { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import type { RadioSelectProps } from './radio-select';
import RadioSelect from './radio-select';

export default {
  component: RadioSelect,
  title: 'Components/RadioSelect',
  argTypes: {
    value: {
      control: 'string',
      description: 'The value that is selected',
      required: true,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    onChange: {
      description: 'Event called after selecting an option',
      required: true,
    },
  },
} as Meta;

const options = [
  {
    title: 'Item 1',
    description: 'Description 1',
    IconComponent: IcoBook16,
    value: 'Item 1',
  },
  {
    title: 'Item 2',
    description: 'Description 2',
    IconComponent: IcoHelp16,
    value: 'Item 2',
  },
];

const Template: Story<RadioSelectProps> = ({
  value = 'Item 1',
  onChange,
  testID,
}: RadioSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  return (
    <RadioSelect
      options={options}
      value={selectedValue}
      onChange={handleChange}
      testID={testID}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
};
