import { IcoBook16, IcoHelp16 } from '@onefootprint/icons';
import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import RadioSelect, { RadioSelectProps } from './radio-select';

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
  },
} as Meta;

const Template: Story<RadioSelectProps> = ({
  value = 'Item 1',
  onSelect,
  testID,
}: RadioSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const handleSelect = (newVal: string) => {
    setSelectedValue(newVal);
    onSelect?.(newVal);
  };
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

  return (
    <RadioSelect
      options={options}
      value={selectedValue}
      onSelect={handleSelect}
      testID={testID}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  onSelect: console.log,
  testID: 'radio-select-test-id',
};
