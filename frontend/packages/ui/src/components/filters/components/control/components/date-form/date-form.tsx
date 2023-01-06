import { useAutoAnimate } from '@formkit/auto-animate/react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import InputDateRangePicker from '../../../../../input-date-range-picker';
import Radio from '../../../../../radio';
import type { FilterDate } from '../../../../filters.types';
import useDateOptions, { Period } from '../../hooks/use-date-options';
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
  const shouldShowDatePicker = watch('period') === Period.Custom;

  const handleAfterSubmit = (formData: FormData) => {
    if (formData.period === Period.Custom) {
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
