import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { useForm } from 'react-hook-form';

import Checkbox from '../../../../../checkbox';
import Typography from '../../../../../typography';
import type {
  FilterMultiSelectGrouped,
  FilterSelectedOption,
} from '../../../../filters.types';

type FormData = {
  filter: FilterSelectedOption[];
};

export type MultiSelectFormProps = {
  onSubmit: (nextSelectedOptions: string[]) => void;
  options: FilterMultiSelectGrouped['options'];
  selectedOptions: FilterMultiSelectGrouped['selectedOptions'];
};

const MultiSelectGroupedForm = ({
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
      {options.map(group => (
        <Fieldset key={group.label}>
          <Typography variant="label-3" sx={{ marginBottom: 3 }}>
            {group.label}
          </Typography>
          {group.options.map(option => (
            <Checkbox
              key={`${option.label}-${option.value}`}
              label={option.label}
              value={option.value}
              {...register('filter')}
            />
          ))}
        </Fieldset>
      ))}
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]};
  `}
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default MultiSelectGroupedForm;
