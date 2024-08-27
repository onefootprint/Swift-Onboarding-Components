import { IcoBook16, IcoBook24, IcoHelp16, IcoHelp24 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import type { RadioSelectProps } from './radio-select';
import RadioSelect from './radio-select';

export default {
  component: RadioSelect,
  title: 'Components/RadioSelect',
  argTypes: {
    value: {
      type: 'string',
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
    options: {
      description: 'The options to be displayed',
      required: true,
    },
    size: {
      control: {
        type: 'select',
        options: ['compact', 'default'],
      },
      description: 'The size of the radio select',
      required: true,
    },
  },
} satisfies Meta<typeof RadioSelect>;

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

const groupedOptions = [
  {
    label: 'Group 1',
    options: [
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
    ],
  },
  {
    label: 'Group 2',
    options: [
      {
        title: 'Item 4',
        description: 'Description 4',
        IconComponent: IcoBook24,
        value: 'Item 4',
      },
      {
        title: 'Item 5',
        description: 'Description 5',
        IconComponent: IcoHelp24,
        value: 'Item 5',
      },
      {
        title: 'Item 6',
        description: 'Description 6',
        IconComponent: IcoBook24,
        value: 'Item 6',
        disabled: true,
        disabledHint: 'Disabled hint',
      },
    ],
  },
];

const Template: StoryFn<RadioSelectProps> = ({
  value = 'Item 1',
  options = defaultOptions,
  onChange,
  testID,
  size,
}: RadioSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  return <RadioSelect options={options} value={selectedValue} onChange={handleChange} testID={testID} size={size} />;
};

export const Default = Template.bind({});
Default.args = {
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
  size: 'default',
  options: defaultOptions,
};

export const Compact = Template.bind({});
Compact.args = {
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
  size: 'compact',
  options: compactOptions,
};

export const Grouped = Template.bind({});
Grouped.args = {
  options: groupedOptions,
  onChange: console.log, // eslint-disable-line no-console
  testID: 'radio-select-test-id',
  size: 'default',
};
