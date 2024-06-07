import { Stack, Text } from '@onefootprint/ui';
import type { Meta, Story } from '@storybook/react';
import { add, format, startOfWeek } from 'date-fns';
import React, { useState } from 'react';

import DateRangeSelector from './date-selector-sheet';
import type { DateSelectorSheetProps } from './date-selector-sheet.types';

export default {
  title: 'Internal/DateSelectorSheet',
  component: DateRangeSelector,
  argTypes: {
    initialStartDate: {
      control: 'date',
      defaultValue: new Date(),
    },
    initialEndDate: {
      control: 'date',
      defaultValue: new Date(),
    },
  },
} as Meta;

const Template: Story<DateSelectorSheetProps> = ({ startDate, endDate }) => {
  const [displayedStartDate, setDisplayedStartDate] = useState(startDate);
  const [displayedEndDate, setDisplayedEndDate] = useState(endDate);

  return (
    <Stack direction="column" gap={4}>
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onChange={newDates => {
          setDisplayedStartDate(newDates.startDate);
          setDisplayedEndDate(newDates.endDate);
        }}
        open
      >
        <Text variant="body-4">
          {displayedStartDate && displayedEndDate
            ? `${format(displayedStartDate, 'MMM dd, yyyy')} - ${format(displayedEndDate, 'MMM dd, yyyy')}`
            : 'Select a date range'}
        </Text>
      </DateRangeSelector>
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {
  startDate: startOfWeek(add(new Date(), { weeks: -1 })),
  endDate: new Date(),
  onChange: ({ startDate, endDate }) => console.log(startDate, endDate),
};
