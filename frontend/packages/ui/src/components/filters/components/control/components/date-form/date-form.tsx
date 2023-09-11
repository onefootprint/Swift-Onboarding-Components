import { useAutoAnimate } from '@formkit/auto-animate/react';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import DateRangeInput from '../../../../../date-range-input';
import Radio from '../../../../../radio';
import type { FilterDate } from '../../../../filters.types';
import { FilterDateRange } from '../../../../filters.types';
import useDateOptions from '../../hooks/use-date-options';
import getFormDefaultValue from './utils/get-form-default-values';

type FormData = {
  period: string;
  customDate: { from: Date; to: Date };
};

type DateFormProps = {
  onSubmit: (period: FilterDate['selectedOptions']) => void;
  selectedOptions: FilterDate['selectedOptions'];
};

const DateForm = ({ onSubmit, selectedOptions }: DateFormProps) => {
  const [animateCustomDate] = useAutoAnimate<HTMLDivElement>();
  const options = useDateOptions();
  const { control, handleSubmit, register, watch } = useForm<FormData>({
    defaultValues: getFormDefaultValue(selectedOptions),
  });
  const shouldShowDatePicker = watch('period') === FilterDateRange.Custom;

  const handleAfterSubmit = (formData: FormData) => {
    if (formData.period === FilterDateRange.Custom) {
      const newFrom = formData.customDate.from.toISOString();
      const newTo = formData.customDate.to.toISOString();
      onSubmit([newFrom, newTo]);
    } else {
      onSubmit([formData.period]);
    }
  };

  return (
    <Form id="filter-form" onSubmit={handleSubmit(handleAfterSubmit)}>
      {options?.map(option => (
        <Radio
          key={`${option.label}-${option.value}`}
          label={option.label}
          value={option.value}
          {...register('period')}
        />
      ))}
      <div ref={animateCustomDate}>
        {shouldShowDatePicker && (
          <Controller
            control={control}
            name="customDate"
            render={({ field }) => (
              <DateRangeInput
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
        )}
      </div>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default DateForm;
