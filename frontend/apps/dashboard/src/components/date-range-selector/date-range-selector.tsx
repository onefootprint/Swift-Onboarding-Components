import { DateRange, dateRangeToDisplayText } from '@onefootprint/types';
import { Box, Radio, TextInput } from '@onefootprint/ui';
import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';

import { DateRangeSelectorFormValues } from './date-range-selector.types';

type DateRangeSelectorProps = {
  register: UseFormRegister<DateRangeSelectorFormValues>;
  errors: FieldErrors<DateRangeSelectorFormValues>;
  watch: UseFormWatch<DateRangeSelectorFormValues>;
};

const DateRangeSelector = ({
  register,
  errors,
  watch,
}: DateRangeSelectorProps) => {
  const watchDateRange = watch('dateRange');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {[
        DateRange.allTime,
        DateRange.today,
        DateRange.currentMonth,
        DateRange.lastWeek,
        DateRange.lastMonth,
        DateRange.custom,
      ].map(value => (
        <Radio
          key={value}
          value={value}
          label={dateRangeToDisplayText[value]}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register('dateRange')}
        />
      ))}
      {watchDateRange === DateRange.custom && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            marginLeft: 8,
            gap: 3,
          }}
        >
          {/* https://linear.app/footprint/issue/FP-426/use-real-date-range-picker-in-filter-on-users-and-filter-on-security */}
          <TextInput
            type="date"
            placeholder="TODO"
            {...register('customDateStart')}
            hasError={!!errors.customDateStart}
          />
          <TextInput
            type="date"
            placeholder="TODO"
            {...register('customDateEnd')}
            hasError={!!errors.customDateEnd}
          />
        </Box>
      )}
    </Box>
  );
};

export default DateRangeSelector;
