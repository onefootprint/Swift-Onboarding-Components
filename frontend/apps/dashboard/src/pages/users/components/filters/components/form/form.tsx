import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from '@onefootprint/hooks';
import { DateRange, OnboardingStatus } from '@onefootprint/types';
import { Box, Checkbox, InputDateRangePicker, Radio } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import Fieldset from 'src/components/fieldset';

export type FormData = {
  customDate: { from: Date; to: Date };
  dateRange?: DateRange | `${DateRange}(${string},${string})`;
  statuses: OnboardingStatus[];
};

type FormProps = {
  onSubmit: (formData: FormData) => void;
  defaultValues: {
    customDate: { from: Date; to: Date };
    dateRange: DateRange;
    statuses: OnboardingStatus[];
  };
};

const Form = ({ defaultValues, onSubmit }: FormProps) => {
  const { t } = useTranslation('pages.users.filters.dialog.form');
  const { control, register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues,
  });
  const [animateCustomDate] = useAutoAnimate<HTMLDivElement>();
  const hasCustomDateRange = watch('dateRange') === DateRange.custom;

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset({ dateRange: DateRange.allTime, statuses: [] });
  };

  const handleBeforeSubmit = (formData: FormData) => {
    if (formData.dateRange === DateRange.allTime) {
      onSubmit({ ...formData, dateRange: undefined });
    } else if (formData.dateRange === DateRange.custom) {
      // TODO:
      // Improve
      onSubmit({
        ...formData,
        dateRange: `${
          DateRange.custom
        }(${formData.customDate.from.toLocaleDateString()},${formData.customDate.to.toLocaleDateString()})`,
      });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form
      id="users-filters"
      name="users-filters"
      onReset={handleReset}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <Fieldset title={t('status.title')}>
        <Checkbox
          {...register('statuses')}
          label={t('status.new')}
          value={OnboardingStatus.verified}
        />
        <Checkbox
          {...register('statuses')}
          label={t('status.manual-review')}
          value={OnboardingStatus.manualReview}
        />
        <Checkbox
          {...register('statuses')}
          label={t('status.processing')}
          value={OnboardingStatus.processing}
        />
        <Checkbox
          {...register('statuses')}
          label={t('status.failed')}
          value={OnboardingStatus.failed}
        />
      </Fieldset>
      <Fieldset title={t('date-range.title')}>
        <Radio
          {...register('dateRange')}
          label={t('date-range.all-time')}
          value={DateRange.allTime}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.today')}
          value={DateRange.today}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.last-month')}
          value={DateRange.lastMonth}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.last-week')}
          value={DateRange.lastWeek}
        />
        <Radio
          {...register('dateRange')}
          label={t('date-range.custom')}
          value={DateRange.custom}
        />
        <Box ref={animateCustomDate}>
          {hasCustomDateRange && (
            <Box sx={{ marginLeft: 5, marginBottom: 3 }}>
              <Controller
                name="customDate"
                control={control}
                render={({ field }) => (
                  <InputDateRangePicker
                    startDate={field.value.from}
                    endDate={field.value.to}
                    onChange={(nextStartDate: Date, nextEndDate: Date) => {
                      field.onChange({
                        from: nextStartDate,
                        to: nextEndDate,
                      });
                    }}
                  />
                )}
              />
            </Box>
          )}
        </Box>
      </Fieldset>
    </form>
  );
};

export default Form;
