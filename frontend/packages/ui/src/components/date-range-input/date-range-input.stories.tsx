import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { DateRangeInputProps } from './date-range-input';
import DateRangeInput from './date-range-input';

export default {
  component: DateRangeInput,
  title: 'Components/DateRangeInput',
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    $width: {
      control: 'text',
    },
  },
} as Meta<DateRangeInputProps>;
const Template: Story<DateRangeInputProps> = ({
  initialStartDate,
  initialEndDate,
  onChange,
}) => (
  <DateRangeInput
    initialStartDate={initialStartDate}
    initialEndDate={initialEndDate}
    onChange={onChange}
  />
);

export const Base = Template.bind({});
Base.args = {
  initialStartDate: new Date('10/05/2024'),
  initialEndDate: new Date('10/10/2024'),
};
