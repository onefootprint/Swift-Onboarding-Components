import React from 'react';
import { useForm } from 'react-hook-form';

import Checkbox from '../../../../../checkbox';
import Grid from '../../../../../grid';
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
    <Grid.Container
      as="form"
      gap={7}
      id="filter-form"
      onSubmit={handleSubmit(handleAfterSubmit)}
    >
      {options.map(group => (
        <Grid.Container as="fieldset" gap={3} key={group.label}>
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
        </Grid.Container>
      ))}
    </Grid.Container>
  );
};

export default MultiSelectGroupedForm;
