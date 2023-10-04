import {
  IcoBook16,
  IcoBook24,
  IcoHelp16,
  IcoHelp24,
} from '@onefootprint/icons';
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

const defaultOptions = [
  {
    title: 'Item 1',
    description: 'Description 1',
    IconComponent: IcoBook24,
    value: 'Item 1',
  },
  {
    title: 'Item 2',
    description: 'Description 2',
    IconComponent: IcoHelp24,
    value: 'Item 2',
  },
  {
    title: 'Item 3',
    description: 'Description 3',
    IconComponent: IcoBook24,
    value: 'Item 3',
    disabled: true,
    disabledHint: 'Disabled hint',
  },
];

const compactOptions = [
  {
    title: 'Item 1',
    IconComponent: IcoBook16,
    value: 'Item 1',
  },
  {
    title: 'Item 2',
    IconComponent: IcoHelp16,
    value: 'Item 2',
  },
  {
    title: 'Item 3',
    IconComponent: IcoBook16,
    value: 'Item 3',
    disabled: true,
    disabledHint: 'Disabled hint',
  },
];

const Template: Story<RadioSelectProps> = ({
  value = 'Item 1',
  onChange,
  testID,
  size,
}: RadioSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  return (
    <RadioSelect
      options={size === 'compact' ? compactOptions : defaultOptions}
      value={selectedValue}
      onChange={handleChange}
      testID={testID}
      size={size}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
  size: 'default',
};

export const Compact = Template.bind({});
Compact.args = {
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
  size: 'compact',
};
