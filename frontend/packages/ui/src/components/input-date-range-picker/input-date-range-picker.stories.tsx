import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import InputDateRangePicker, {
  InputDateRangePickerProps,
} from './input-date-range-picker';

export default {
  component: InputDateRangePicker,
  title: 'Components/InputDateRangePicker',
  argTypes: {},
} as Meta;

const Template: Story<InputDateRangePickerProps> = ({
  onChange,
  endDate: initialEndDate,
  startDate: initialStartDate,
}: InputDateRangePickerProps) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);

  return (
    <InputDateRangePicker
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
  onChange: console.log,
  startDate: new Date('10/05/2021'),
};
