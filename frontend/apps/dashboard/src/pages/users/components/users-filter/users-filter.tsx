import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import {
  DateRange,
  dateRangeToDisplayText,
  getDateRange,
  OnboardingStatus,
  serializeDateRange,
  statusToDisplayText,
} from 'src/types';
import styled, { css } from 'styled-components';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  Divider,
  TextInput,
  Typography,
} from 'ui';
import RadioInput from 'ui/src/components/radio-input';
import * as yup from 'yup';

type FormValues = {
  onboardingStatuses: Array<OnboardingStatus>;
  dateRange: DateRange;
  customDateStart?: string;
  customDateEnd?: string;
};

const formSchema = yup
  .object()
  .shape({
    onboardingStatuses: yup.array().of(yup.string()),
    dateRange: yup.string().required(),
    customDateStart: yup.string().when('dateRange', {
      is: DateRange.custom,
      then: yup.string().required('Must provide date range start'),
    }),
    customDateEnd: yup
      .string()
      .when('dateRange', {
        is: DateRange.custom,
        then: yup.string().required('Must provide date range end'),
      })
      .test(
        'End after start',
        'Date end should be after date start',
        (value: string | undefined, context: yup.TestContext) =>
          context.parent.dateRange !== DateRange.custom ||
          (!!value &&
            (!context.parent.customDateStart ||
              context.parent.customDateStart < value)),
      ),
  })
  .required();

const UsersFilter = () => {
  const { filters, setFilter } = useFilters();

  const [showDialog, setShowDialog] = useState(false);
  const { getValues, register, setValue, watch, trigger, formState } =
    useForm<FormValues>({
      resolver: yupResolver(formSchema),
    });
  const watchDateRange = watch('dateRange');

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
            DateRange.custom,
          ].map(value => (
            <RadioInput
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
                hasError={!!formState.errors.customDateStart}
              />
              <TextInput
                type="date"
                placeholder="TODO"
                {...register('customDateEnd')}
                hasError={!!formState.errors.customDateEnd}
              />
            </Box>
          )}
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
