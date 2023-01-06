import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Checkbox from '../../../../../checkbox';
import type {
  FilterMultiSelect,
  FilterSelectedOption,
} from '../../../../filters.types';

type FormData = {
  filter: FilterSelectedOption[];
};

export type MultiSelectFormProps = {
  onSubmit: (nextSelectedOptions: string[]) => void;
  options: FilterMultiSelect['options'];
  selectedOptions: FilterMultiSelect['selectedOptions'];
};

const MultiSelectForm = ({
  onSubmit,
  options,
  selectedOptions,
}: MultiSelectFormProps) => {
  const { handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      filter: selectedOptions,
    },
  });

  const handleAfterSubmit = (formData: FormData) => {
    onSubmit(formData.filter);
  };

  return (
    <Form id="filter-form" onSubmit={handleSubmit(handleAfterSubmit)}>
      {options.map(option => (
        <Checkbox
          key={`${option.label}-${option.value}`}
          label={option.label}
          value={option.value}
          {...register('filter')}
        />
      ))}
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default MultiSelectForm;
