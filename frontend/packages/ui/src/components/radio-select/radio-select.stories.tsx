import { Meta, Story } from '@storybook/react';
import IcoBook16 from 'icons/src/icos/ico-book-16';
import IcoHelp16 from 'icons/src/icos/ico-help-16';
import React from 'react';

import RadioSelect, { RadioSelectProps } from './radio-select';

export default {
  component: RadioSelect,
  title: 'Components/RadioSelect',
  argTypes: {
    defaultSelected: {
      control: 'number',
      description: 'The index that is selected by default',
      required: true,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: Story<RadioSelectProps> = ({
  defaultSelected,
  onSelect,
  testID,
}: RadioSelectProps) => {
  const handleSelect = (value: string) => {
    onSelect?.(value);
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
      defaultSelected={defaultSelected}
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
