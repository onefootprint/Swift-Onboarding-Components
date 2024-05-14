import cx from 'classnames';
import get from 'lodash/get';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

import { useFootprint } from '../../../hooks/use-footprint';
import type { SelectProps } from '../internal/select';
import Select from '../internal/select';

export type CustomSelectProps = Omit<SelectProps, 'label' | 'placeholder'> & {
  identifier: string;
  label: string;
  placeholder: string;
  validations: {
    required?: string;
    validate?: (value: string) => string | boolean;
  };
};

const CustomSelect = ({
  className,
  identifier,
  label,
  placeholder,
  validations,
  ...props
}: CustomSelectProps) => {
  const elClassName = kebabCase(`fp-${identifier}-input`);
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const error = get(errors, identifier);

  return (
    <Select
      className={cx(elClassName, className)}
      hasError={!!error}
      label={label}
      message={error?.message}
      {...props}
      {...register(identifier, validations)}
      name={identifier || props.name}
    >
      <option value="">{placeholder}</option>
      {props.children}
    </Select>
  );
};

export default CustomSelect;
