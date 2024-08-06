/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import React from 'react';

import { useFormContext } from 'react-hook-form';
import useFieldProps, { FormSelectProps } from '../hooks/use-field-props';

export type StringOrNumber = string | number;

export type SelectOption<T extends StringOrNumber = string> = {
  value: T;
  label: string;
  id: string;
  className?: string;
};
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode;
};

const Select = ({ children, className, id, ...props }: SelectProps) => {
  const { register } = useFormContext();
  const fieldProps = useFieldProps() as FormSelectProps;
  const { name, className: baseClassName, validations = {}, transforms = {}, ...allProps } = fieldProps;

  const formOptions = {
    ...validations,
    ...transforms,
  };

  return (
    <select
      {...allProps}
      {...props}
      className={cx('fp-select', baseClassName, className)}
      {...register(name, formOptions)}
    >
      {children}
    </select>
  );
};

export default Select;
