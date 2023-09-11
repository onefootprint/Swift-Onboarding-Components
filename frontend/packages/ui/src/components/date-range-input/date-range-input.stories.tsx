import type { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import type { DateRangeInputProps } from './date-range-input';
import DateRangeInput from './date-range-input';

export default {
  component: DateRangeInput,
  title: 'Components/DateRangeInput',
  argTypes: {},
} as Meta;

const Template: Story<DateRangeInputProps> = ({
  onChange,
  endDate: initialEndDate,
  startDate: initialStartDate,
}: DateRangeInputProps) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);

  return (
    <DateRangeInput
      onChange={(nextStartDate: Date, nextEndDate: Date) => {
        setStartDate(nextStartDate);
        setEndDate(nextEndDate);
        onChange?.(nextStartDate, nextEndDate);
      }}
      startDate={startDate}
      endDate={endDate}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  endDate: new Date('10/10/2021'),
  onChange: console.log, // eslint-disable-line no-console
  startDate: new Date('10/05/2021'),
};
