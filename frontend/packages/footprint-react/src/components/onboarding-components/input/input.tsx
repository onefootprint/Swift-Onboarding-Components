/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import Cleave from 'cleave.js';
import type React from 'react';
import { useEffect } from 'react';

import { useFormContext } from 'react-hook-form';
import useFieldProps, { type FormInputProps } from '../hooks/use-field-props';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, id, ...props }: InputProps) => {
  const { register } = useFormContext();
  const fieldProps = useFieldProps() as FormInputProps;
  const { name, className: baseClassName, mask, validations = {}, transforms = {}, ...allProps } = fieldProps;

  useEffect(() => {
    let cleaveInstance: Cleave | null = null;
    if (mask) cleaveInstance = new Cleave(`.${baseClassName}`, mask);
    return () => {
      if (cleaveInstance) cleaveInstance.destroy();
    };
  });
  const formOptions = {
    ...validations,
    ...transforms,
  };

  return (
    <input
      {...allProps}
      {...props}
      className={cx('fp-input', baseClassName, className)}
      {...register(name, {
        ...formOptions,
        onBlur: props.onBlur,
        onChange: props.onChange,
      })}
    />
  );
};

export default Input;
