import React, { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import Checkbox from '../../../../../checkbox';
import Radio from '../../../../../radio';
import type {
  FilterMultiSelect,
  FilterSelectedOption,
  FilterSingleSelect,
} from '../../../../filters.types';

type FormData = {
  filter: FilterSelectedOption | FilterSelectedOption[];
};

export enum SelectFormKind {
  multiSelect = 'multi',
  singleSelect = 'single',
}

export type SelectFormProps = {
  kind: SelectFormKind;
  onSubmit: (nextSelectedOptions: string | string[]) => void;
  options: FilterMultiSelect['options'] | FilterSingleSelect['options'];
  selectedOptions:
    | FilterMultiSelect['selectedOptions']
    | FilterSingleSelect['selectedOptions'];
};

const SelectForm = ({
  kind,
  onSubmit,
  options,
  selectedOptions,
}: SelectFormProps) => {
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
        <Fragment key={`${option.label}-${option.value}`}>
          {kind === SelectFormKind.multiSelect && (
            <Checkbox
              label={option.label}
              value={option.value}
              {...register('filter')}
            />
          )}
          {kind === SelectFormKind.singleSelect && (
            <Radio
              label={option.label}
              value={option.value}
              {...register('filter')}
            />
          )}
        </Fragment>
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

export default SelectForm;
