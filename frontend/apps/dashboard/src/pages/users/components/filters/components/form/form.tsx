import { useTranslation } from '@onefootprint/hooks';
import { DateRange, OnboardingStatus } from '@onefootprint/types';
import { Checkbox, Radio } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import Fieldset from './components/fieldset';

export type FormData = {
  dateRange?: DateRange;
  statuses: OnboardingStatus[];
};

type FormProps = {
  onSubmit: (formData: FormData) => void;
  defaultValues: {
    dateRange: DateRange;
    statuses: OnboardingStatus[];
  };
};

const Form = ({ defaultValues, onSubmit }: FormProps) => {
  const { t } = useTranslation('pages.users.filters.dialog.form');
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues,
  });

  const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset({ dateRange: DateRange.allTime, statuses: [] });
  };

  const handleBeforeSubmit = (formData: FormData) => {
    if (formData.dateRange === DateRange.allTime) {
      onSubmit({ ...formData, dateRange: undefined });
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
      </Fieldset>
    </form>
  );
};

export default Form;
