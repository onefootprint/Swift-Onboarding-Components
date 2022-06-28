import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import {
  FieldErrors,
  useForm,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import DateRangeSelector, {
  dateRangeSelectorFormSchema,
  DateRangeSelectorFormValues,
} from 'src/components/date-range-selector';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import {
  getDateRange,
  OnboardingStatus,
  serializeDateRange,
  statusToDisplayText,
} from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Button, Checkbox, Dialog, Divider, Typography } from 'ui';

type FormValues = DateRangeSelectorFormValues & {
  onboardingStatuses: Array<OnboardingStatus>;
};

const UsersFilter = () => {
  const { filters, setFilter } = useFilters();

  const [showDialog, setShowDialog] = useState(false);
  const { getValues, register, setValue, watch, trigger, formState } =
    useForm<FormValues>({
      resolver: yupResolver(dateRangeSelectorFormSchema),
    });

  const openDialog = () => {
    // Update the state of the dialog to represent what's in the querystring, then open it
    const statusesStr = filters.statuses || '';
    const selectedFields = statusesStr ? statusesStr.split(',') : [];
    setValue('onboardingStatuses', selectedFields as OnboardingStatus[]);
    const [dateRange, customDateStart, customDateEnd] = getDateRange(filters);
    setValue('dateRange', dateRange);
    setValue('customDateStart', customDateStart);
    setValue('customDateEnd', customDateEnd);
    setShowDialog(true);
  };

  const handleApplyClick = async () => {
    const isValidated = await trigger();
    if (!isValidated) {
      return;
    }
    setFilter({
      statuses: getValues('onboardingStatuses').join(','),
      dateRange: serializeDateRange(
        ...getValues(['dateRange', 'customDateStart', 'customDateEnd']),
      ),
    });
    setShowDialog(false);
  };
  const handleClearClick = () => {
    // Clear the filter
    setFilter({ statuses: undefined, dateRange: undefined });
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
        <DateRangeSelector
          register={
            register as unknown as UseFormRegister<DateRangeSelectorFormValues>
          }
          errors={formState.errors as FieldErrors<DateRangeSelectorFormValues>}
          watch={watch as unknown as UseFormWatch<DateRangeSelectorFormValues>}
        />
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
