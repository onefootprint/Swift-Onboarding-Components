import type { Meta, StoryFn } from '@storybook/react';
import { add, format, startOfWeek } from 'date-fns';
import { useState } from 'react';
import Stack from '../stack';
import Text from '../text';

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

const Template: StoryFn<DateSelectorSheetProps> = ({ startDate, endDate }) => {
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
        <Text variant="body-3">
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
  startDate: startOfWeek(add(new Date('2025-02-15'), { weeks: -1 })),
  endDate: new Date('2025-02-15'),
  onChange: ({ startDate, endDate }) => console.log(startDate, endDate),
};
