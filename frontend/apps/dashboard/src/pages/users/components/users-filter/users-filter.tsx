import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDateRange, useFilters } from 'src/pages/users/hooks/use-filters';
import {
  DateRange,
  dateRangeToDisplayText,
  OnboardingStatus,
  statusToDisplayText,
} from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Button, Checkbox, Dialog, Divider, Typography } from 'ui';
import RadioInput from 'ui/src/components/radio-input';

type FormValues = {
  onboardingStatuses: Array<OnboardingStatus>;
  dateRange: DateRange;
};

const UsersFilter = () => {
  const { query, setFilter } = useFilters();

  const [showDialog, setShowDialog] = useState(false);
  const { getValues, register, setValue } = useForm<FormValues>();

  const openDialog = () => {
    // Update the state of the dialog to represent what's in the querystring, then open it
    const statusesStr = query.statuses || '';
    const selectedFields = statusesStr ? statusesStr.split(',') : [];
    setValue('onboardingStatuses', selectedFields as OnboardingStatus[]);
    setValue('dateRange', getDateRange(query));
    setShowDialog(true);
  };

  const handleApplyClick = () => {
    const dateRange = getValues('dateRange');
    // Serialize allTime date range as nothing for a cleaner querystring
    const cleanedDateRange =
      dateRange === DateRange.allTime ? undefined : dateRange;
    setFilter({
      statuses: getValues('onboardingStatuses').join(','),
      dateRange: cleanedDateRange,
    });
    setShowDialog(false);
  };
  const handleClearClick = () => {
    // Clear the filter
    setFilter({
      statuses: undefined,
      dateRange: undefined,
    });
    setShowDialog(false);
  };

  return (
    <>
      <Dialog
        size="compact"
        title="Filters"
        primaryButton={{
          label: 'Apply',
          onClick: handleApplyClick,
        }}
        linkButton={{
          label: 'Clear',
          onClick: handleClearClick,
        }}
        onClose={() => setShowDialog(false)}
        open={showDialog}
      >
        <Typography variant="label-1" sx={{ marginBottom: 6 }}>
          Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {[
            OnboardingStatus.verified,
            OnboardingStatus.incomplete,
            OnboardingStatus.manualReview,
            OnboardingStatus.processing,
            OnboardingStatus.failed,
          ].map(value => (
            <Checkbox
              label={statusToDisplayText[value]}
              key={value}
              value={value}
              {...register('onboardingStatuses')}
            />
          ))}
        </Box>
        <Box sx={{ marginTop: 7, marginBottom: 7 }}>
          <Divider />
        </Box>
        <Typography variant="label-1" sx={{ marginBottom: 6 }}>
          Date range
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {[
            DateRange.allTime,
            DateRange.today,
            DateRange.currentMonth,
            DateRange.lastWeek,
            DateRange.lastMonth,
          ].map(value => (
            <RadioInput
              key={value}
              value={value}
              label={dateRangeToDisplayText[value]}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...register('dateRange')}
            />
          ))}
        </Box>
      </Dialog>
      <FilterButtonContainer>
        <Button size="small" variant="secondary" onClick={openDialog}>
          Filters
        </Button>
      </FilterButtonContainer>
    </>
  );
};

const FilterButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    margin-right: ${theme.spacing[6]}px;
  `};
`;

export default UsersFilter;
