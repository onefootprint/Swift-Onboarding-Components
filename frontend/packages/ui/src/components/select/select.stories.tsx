import { STATES } from '@onefootprint/global-constants';
import type { ComponentMeta, Story } from '@storybook/react';
import { useState } from 'react';

import Box from '../box';
import type { SelectOption, SelectProps } from './select';
import Select from './select';

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: {
      control: {
        type: 'select',
      },
      type: { name: 'string', required: false },
      description: 'Size',
      options: ['default', 'compact'],
      table: { defaultValue: { summary: 'default' } },
    },
  },
} as ComponentMeta<typeof Select>;

const Template: Story<SelectProps> = ({
  disabled,
  hasError,
  hint,
  label,
  onChange,
  options = STATES,
  placeholder,
  searchPlaceholder,
  size,
  value,
}: SelectProps) => {
  const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(value);

  const handleSelect = (newOption: SelectOption) => {
    setSelectedOption(newOption);
    if (onChange) {
      onChange(newOption);
    }
  };

  return (
    <Box width="300px">
      <Select
        disabled={disabled}
        hasError={hasError}
        hint={hint}
        label={label}
        onChange={handleSelect}
        options={options}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        size={size}
        value={selectedOption}
      />
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hasError: false,
  hint: '',
  size: 'default',
  label: 'State',
  onChange: console.log, // eslint-disable-line no-console
  options: STATES,
  placeholder: 'Select',
  searchPlaceholder: 'Search',
  value: undefined,
};

export const Small = Template.bind({});
Small.args = {
  disabled: false,
  hasError: false,
  hint: '',
  size: 'compact',
  label: 'State',
  onChange: console.log, // eslint-disable-line no-console
  options: [
    { label: 'Month to date', value: '1' },
    { label: 'Previous month', value: '2' },
    { label: 'All time', value: '3' },
  ],
  placeholder: 'Select',
  searchPlaceholder: 'Search',
  value: undefined,
};

export const Custom = Template.bind({});
Custom.args = {
  disabled: false,
  hasError: false,
  hint: '',
  size: 'default',
  label: 'Outcome',
  onChange: console.log, // eslint-disable-line no-console
  options: [
    { label: 'Success', value: 'success' },
    { label: 'Fail', value: 'fail' },
    { label: 'Manual Review', value: 'manual_review' },
    {
      label: 'Step up',
      value: 'step_up',
      description: 'Users will upload ID photos if not initially required by the configuration.',
    },
  ],
  placeholder: 'Select',
  searchPlaceholder: 'Search',
  value: undefined,
};
